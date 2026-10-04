import { UnprocessableEntityError } from '../../../errors/UnprocessableEntityError.js'
import type { CreateIntervalInput, ID, ISODate, UpdateIntervalInput } from '../../../schemas/scheduleSchema.js'
import * as scheduleRepository from './schedule.repository.js'
import { findMasterById } from '../master.repository.js'
import { NotFoundError } from '../../../errors/NotFoundError.js'
import { toIntervalResponse, toVersionResponse, type ScheduleIntervalResponse, type ScheduleVersionResponse } from './schedule.mapper.js'
import { withTransaction } from '../../../db/withTransaction.js'

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

export const updateInterval = async(
    interval_id: number,
    master_id: number,
    data: UpdateIntervalInput
) => {
    const existing = await scheduleRepository.findIntervalById(interval_id, master_id)
    if (!existing) return null

    const starts_at = data.starts_at ?? existing.starts_at.slice(0, 5)
    const ends_at = data.ends_at ?? existing.ends_at.slice(0, 5)

    if (starts_at >= ends_at) {
        throw new UnprocessableEntityError('starts_at must be earlier than ends_at')
    }

    return scheduleRepository.update(interval_id, master_id, data)
}

export const removeInterval = async(interval_id: number, master_id: number) => {
    return scheduleRepository.remove(interval_id, master_id)
}