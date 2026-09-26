import { pool } from '../../../db/pool.js'
import { ConflictError } from '../../../errors/ConflictError.js'
import { isCheckViolation, isExclusionViolation } from '../../../errors/pgErrorCodes.js'
import { UnprocessableEntityError } from '../../../errors/UnprocessableEntityError.js'

export type ScheduleRow = {
    id: number,
    master_id: number,
    day_of_week: number,
    starts_at: string,
    ends_at: string  
}

export const create = async(
    master_id: number,
    day_of_week: number,
    starts_at: string,
    ends_at: string    
): Promise<ScheduleRow> => {
    try {
        const result = await pool.query<ScheduleRow>(
            `
            INSERT INTO master_schedule_intervals (master_id, day_of_week, starts_at, ends_at)
            VALUES ($1, $2, $3, $4)
            RETURNING id, master_id, day_of_week, starts_at, ends_at
            `, [master_id, day_of_week, starts_at, ends_at]
        )
        const row = result.rows[0]
        if (!row) {
            throw new Error('Insert did not return a row')
        }
        return row
    } catch (error) {
        if (isExclusionViolation(error)) {
            throw new ConflictError('Master intervals are overlapping.')
        }
        if (isCheckViolation(error)) {
            throw new UnprocessableEntityError('day_of_week must be between (1 and 7) and starts_at must be earlier than ends_at')
        }
        throw error
    }
}

export const findIntervals = async(master_id: number): Promise<ScheduleRow[]> => {
    const result = await pool.query<ScheduleRow>(
        `
        SELECT id, day_of_week, starts_at, ends_at
        FROM master_schedule_intervals
        WHERE master_id = $1
        `, [master_id]
    )
    return result.rows
}