import { UnprocessableEntityError } from '../../../errors/UnprocessableEntityError.js'
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