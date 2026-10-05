import { UnprocessableEntityError } from '../../../errors/UnprocessableEntityError.js'
import type { CreateIntervalInput, ID, ISODate } from '../../../schemas/scheduleSchema.js'
import * as scheduleRepository from './schedule.repository.js'
import { findMasterById } from '../master.repository.js'
import { NotFoundError } from '../../../errors/NotFoundError.js'
import { toIntervalResponse, toVersionResponse, type ScheduleIntervalResponse, type ScheduleVersionResponse } from './schedule.mapper.js'
import { withTransaction } from '../../../db/withTransaction.js'
import { ConflictError } from '../../../errors/ConflictError.js'
import { AppError } from '../../../errors/AppError.js'

type ScheduleResponse = {
    version: ScheduleVersionResponse | null
    intervals: ScheduleIntervalResponse[]
}

type ScheduleVersionDetailsResponse = {
    version: ScheduleVersionResponse
    intervals: ScheduleIntervalResponse[]
}

const BUSINESS_TIME_ZONE = 'Asia/Almaty'

const getToday = (): ISODate =>
    new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIME_ZONE }).format(new Date())

export const createVersionForMaster = async(
    master_id: ID,
    date: ISODate,
    intervals: CreateIntervalInput[]
): Promise<ScheduleVersionDetailsResponse> => {
    const master = await findMasterById(master_id)
    if (!master) {
        throw new NotFoundError(`Master with id ${master_id} not found`)
    }
    
    if (date <= getToday()) {
        throw new UnprocessableEntityError('effective_from must be later than today')
    }

    intervals.forEach((interval, index) => {
        if (interval.starts_at >= interval.ends_at) {
            throw new UnprocessableEntityError(
                `Interval #${index + 1}: starts_at must be earlier than ends_at`
            )
        }
    })

    const { version, createdIntervals } = await withTransaction(
        async client => {
            const version = await scheduleRepository.createVersion(client, master_id, date)

            const createdIntervals: scheduleRepository.ScheduleIntervalRow[] = []
            for (const interval of intervals) {
                createdIntervals.push(
                    await scheduleRepository.createInterval(client, version.id, interval)
                )
            }
            return { version, createdIntervals }
        }
    )

    createdIntervals.sort((a, b) => 
        a.day_of_week - b.day_of_week || a.starts_at.localeCompare(b.starts_at)
    )

    return {
        version: toVersionResponse(version),
        intervals: createdIntervals.map(interval => toIntervalResponse(interval))
    }
}

export const findScheduleForDate = async(
    master_id: ID,
    date: ISODate
): Promise<ScheduleResponse> => {
    const master = await findMasterById(master_id)
    if (!master) {
        throw new NotFoundError(`Master with id ${master_id} not found`)
    }
    
    const version = await scheduleRepository.findVersionForDate(master_id, date)
    if (!version) return { version: null, intervals: [] }
    
    const intervals = await scheduleRepository.findIntervalsByVersionId(version.id)
    return {
        version: toVersionResponse(version),
        intervals: intervals.map(interval => toIntervalResponse(interval))
    }
}

export const findVersionsForMaster = async(master_id: ID): Promise<ScheduleVersionResponse[]> => {
    const master = await findMasterById(master_id)
    if (!master) {
        throw new NotFoundError(`Master with id ${master_id} not found`)
    }

    const versions = await scheduleRepository.findVersionsForMaster(master_id)
    return versions.map(version => toVersionResponse(version))
}

export const findScheduleByVersionId = async(
    master_id: ID,
    versionId: ID
): Promise<ScheduleResponse> => {
    const master = await findMasterById(master_id)
    if (!master) {
        throw new NotFoundError(`Master with id ${master_id} not found`)
    }

    const version = await scheduleRepository.findVersionById(master_id, versionId)
    if (!version) {
        throw new NotFoundError(`Schedule version with id ${versionId} not found for master ${master_id}`)
    }

    const intervals = await scheduleRepository.findIntervalsByVersionId(version.id)
    return {
        version: toVersionResponse(version),
        intervals: intervals.map(interval => toIntervalResponse(interval))
    }
}

export const updateVersionForMaster = async(
    master_id: ID,
    versionId: ID,
    date: ISODate,
    intervals: CreateIntervalInput[]
): Promise<ScheduleVersionDetailsResponse> => {
    const master = await findMasterById(master_id)
    if (!master) {
        throw new NotFoundError(`Master with id ${master_id} not found`)
    }

    const version = await scheduleRepository.findVersionById(master_id, versionId)
    if (!version) {
        throw new NotFoundError(`Version with id ${versionId} not found`)
    }

    const today = getToday()

    if (version.effective_from <= today) {
        throw new ConflictError('Past or today\'s effective versions cannot be edited')
    }

    if (date <= today) {
        throw new UnprocessableEntityError('effective_from must be later than today')
    }

    intervals.forEach((interval, index) => {
        if (interval.starts_at >= interval.ends_at) {
            throw new UnprocessableEntityError(
                `Interval #${index + 1}: starts_at must be earlier than ends_at`
            )
        }
    })
    
    const { updatedVersion, createdIntervals } = await withTransaction(
        async client => {
            const updatedVersion = await scheduleRepository.updateVersionDate(client, master_id, versionId, date)
            
            await scheduleRepository.deleteIntervalsByVersionId(client, versionId)

            const createdIntervals: scheduleRepository.ScheduleIntervalRow[] = []
            for (const interval of intervals) {
                createdIntervals.push(
                    await scheduleRepository.createInterval(client, versionId, interval)
                )
            }
            return { updatedVersion, createdIntervals }
        }
    )

    createdIntervals.sort((a, b) => 
        a.day_of_week - b.day_of_week || a.starts_at.localeCompare(b.starts_at)
    )

    return {
        version: toVersionResponse(updatedVersion),
        intervals: createdIntervals.map(interval => toIntervalResponse(interval))
    }
}