import { UnprocessableEntityError } from '../../../errors/UnprocessableEntityError.js'
import type { UpdateScheduleInput } from '../../../schemas/scheduleSchema.js'
import * as scheduleRepository from './schedule.repository.js'

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

export const findAllIntervals = async(master_id: number) => {
    return scheduleRepository.findIntervals(master_id)
}

export const updateInterval = async(
    interval_id: number,
    master_id: number,
    data: UpdateScheduleInput
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