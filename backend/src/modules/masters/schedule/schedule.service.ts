import { UnprocessableEntityError } from '../../../errors/UnprocessableEntityError.js'
import type { ID, ISODate, UpdateIntervalInput } from '../../../schemas/scheduleSchema.js'
import * as scheduleRepository from './schedule.repository.js'
import { findMasterById } from '../master.repository.js'
import { NotFoundError } from '../../../errors/NotFoundError.js'
import { toIntervalResponse, toVersionResponse, type ScheduleIntervalResponse, type ScheduleVersionResponse } from './schedule.mapper.js'

type ScheduleResponse = {
    version: ScheduleVersionResponse | null
    intervals: ScheduleIntervalResponse[]
}

export const createInterval = async(
    master_id: number,
    day_of_week: number,
    starts_at: string,
    ends_at: string
) => {
    if (starts_at >= ends_at) {
        throw new UnprocessableEntityError('starts_at must be earlier than ends_at')
    }
    return scheduleRepository.create(master_id, day_of_week, starts_at, ends_at)
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