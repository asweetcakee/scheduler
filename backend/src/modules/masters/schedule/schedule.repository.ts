import type { PoolClient } from 'pg'
import { pool } from '../../../db/pool.js'
import { ConflictError } from '../../../errors/ConflictError.js'
import { getConstraintName, isCheckViolation, isExclusionViolation, isUniqueViolation } from '../../../errors/pgErrorCodes.js'
import { UnprocessableEntityError } from '../../../errors/UnprocessableEntityError.js'
import type { CreateIntervalInput, DayOfWeek, ID, ISODate, TimeFormat, UpdateIntervalInput } from '../../../schemas/scheduleSchema.js'

export type ScheduleIntervalRow = {
    id: ID,
    day_of_week: DayOfWeek,
    starts_at: string,
    ends_at: string
}

export type ScheduleVersionRow = {
    id: ID,
    effective_from: ISODate
}

export const createVersion = async (
    client: PoolClient,
    master_id: ID,
    date: ISODate
): Promise<ScheduleVersionRow> => {
    try {
        const result = await client.query<ScheduleVersionRow>(
            `
            INSERT INTO master_schedule_versions (master_id, effective_from)
            VALUES ($1, $2)
            RETURNING id, effective_from::text AS effective_from
            `, [master_id, date]
        )

        const row = result.rows[0]
        if (!row) {
            throw new Error('Version insert did not return a row')
        }
        return row
    } catch (error) {
        if (isUniqueViolation(error)) {
            throw new ConflictError('Version with this date already exists')
        }
        throw error
    }
}

export const createInterval = async (
    client: PoolClient,
    version_id: ID,
    interval: CreateIntervalInput
): Promise<ScheduleIntervalRow> => {
    try {
        const result = await client.query<ScheduleIntervalRow>(
            `
            INSERT INTO master_schedule_intervals (schedule_version_id, day_of_week, starts_at, ends_at)
            VALUES ($1, $2, $3, $4)
            RETURNING id, day_of_week, starts_at, ends_at
            `, [version_id, interval.day_of_week, interval.starts_at, interval.ends_at]
        )
        const row = result.rows[0]
        if (!row) throw new Error('Interval insert did not return a row')
        return row
    } catch (error) {
        if (isExclusionViolation(error)) {
            throw new ConflictError('Intervals are overlapping')
        }
        if (isCheckViolation(error)) {
            const constraint = getConstraintName(error)
            if (constraint === 'master_schedule_intervals_day_of_week_check') {
                throw new UnprocessableEntityError('day_of_week must be between 1 and 7')
            }
            if (constraint === 'master_schedule_intervals_check') {
                throw new UnprocessableEntityError('starts_at must be earlier than ends_at')
            }
            throw new UnprocessableEntityError('Interval violates a check constraint')
        }
        throw error
    }
}

export const findVersionForDate = async(master_id: ID, date: ISODate): Promise<ScheduleVersionRow | null> => {
    const result = await pool.query<ScheduleVersionRow>(
        `
        SELECT id, effective_from::text AS effective_from
        FROM master_schedule_versions
        WHERE master_id = $1 AND effective_from <= $2
        ORDER BY effective_from DESC
        LIMIT 1
        `, [master_id, date]
    )

    return result.rows[0] ?? null
}

export const findIntervalsByVersionId = async(schedule_version_id: ID): Promise<ScheduleIntervalRow[]> => {
    const result = await pool.query<ScheduleIntervalRow>(
        `
        SELECT id, day_of_week, starts_at, ends_at
        FROM master_schedule_intervals
        WHERE schedule_version_id = $1
        ORDER BY day_of_week, starts_at
        `, [schedule_version_id]
    )
    return result.rows
}

export const findVersionsForMaster = async(master_id: ID): Promise<ScheduleVersionRow[]> => {
    const result = await pool.query<ScheduleVersionRow>(
        `
        SELECT id, effective_from::text AS effective_from
        FROM master_schedule_versions
        WHERE master_id = $1
        ORDER BY effective_from DESC
        `, [master_id]
    )
    return result.rows
}

export const findVersionById = async(master_id: ID, versionId: ID): Promise<ScheduleVersionRow | null> => {
    const result = await pool.query<ScheduleVersionRow>(
        `
        SELECT id, effective_from::text AS effective_from
        FROM master_schedule_versions
        WHERE master_id = $1 AND id = $2
        `, [master_id, versionId]
    )
    return result.rows[0] ?? null
}

export const update = async(
    interval_id: number,
    master_id: number,
    data: UpdateIntervalInput  
): Promise<IntervalRow | null> => {
    try {
        const fields: string[] = []
        const values: unknown[] = []
        
        if (data.day_of_week !== undefined) {
            fields.push(`day_of_week = $${fields.length + 1}`)
            values.push(data.day_of_week)
        }

        if (data.starts_at !== undefined) {
            fields.push(`starts_at = $${fields.length + 1}`)
            values.push(data.starts_at)
        }

        if (data.ends_at !== undefined) {
            fields.push(`ends_at = $${fields.length + 1}`)
            values.push(data.ends_at)
        }
        
        values.push(interval_id)
        values.push(master_id)

        const idsCondition = `id = $${values.length - 1} AND master_id = $${values.length}`

        const result = await pool.query<IntervalRow>(
            `
            UPDATE master_schedule_intervals
            SET ${fields.join(', ')}
            WHERE ${idsCondition}
            RETURNING id, day_of_week, starts_at, ends_at
            `, values
        )
        return result.rows[0] ?? null
    } catch (error) {
        if (isExclusionViolation(error)) {
            throw new ConflictError('Master intervals are overlapping.')
        }
        if (isCheckViolation(error)) {
            const constraint = getConstraintName(error)
            if (constraint === 'master_schedule_intervals_day_of_week_check') {
                throw new UnprocessableEntityError('day_of_week must be between 1 and 7')
            }
            if (constraint === 'master_schedule_intervals_check') {
                throw new UnprocessableEntityError('starts_at must be earlier than ends_at')
            }
            throw new UnprocessableEntityError('Interval violates a check constraint')
        }
        throw error
    }
}

export const remove = async(interval_id: number, master_id: number): Promise<boolean> => {
    const result = await pool.query<IntervalRow>(
        `
        DELETE FROM master_schedule_intervals
        WHERE id = $1 AND master_id = $2
        `, [interval_id, master_id]
    )
    return (result.rowCount ?? 0) > 0
}