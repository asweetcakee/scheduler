import type { ScheduleRow } from './schedule.repository.js'

type ScheduleResponse = {
    id: number,
    day_of_week: number,
    starts_at: string,
    ends_at: string
}

export const toScheduleResponse = (row: ScheduleRow): ScheduleResponse => ({
    id: Number(row.id),
    day_of_week: Number(row.day_of_week),
    starts_at: row.starts_at.slice(0, 5),
    ends_at: row.ends_at.slice(0, 5)
})