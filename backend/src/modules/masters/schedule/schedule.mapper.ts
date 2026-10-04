import type { DayOfWeek, ID, ISODate, TimeFormat } from '../../../schemas/scheduleSchema.js'
import type { ScheduleIntervalRow, ScheduleVersionRow } from './schedule.repository.js'

export type ScheduleIntervalResponse = {
    id: ID
    day_of_week: DayOfWeek
    starts_at: TimeFormat
    ends_at: TimeFormat
}

export type ScheduleVersionResponse = {
    id: ID
    effective_from: ISODate
}

export const toIntervalResponse = (row: ScheduleIntervalRow): ScheduleIntervalResponse => ({
    id: Number(row.id),
    day_of_week: Number(row.day_of_week),
    starts_at: row.starts_at.slice(0, 5),
    ends_at: row.ends_at.slice(0, 5)
})

export const toVersionResponse = (row: ScheduleVersionRow): ScheduleVersionResponse => ({
    id: Number(row.id),
    effective_from: row.effective_from
})