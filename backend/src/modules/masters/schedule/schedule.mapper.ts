import type { IntervalRow } from './schedule.repository.js'

type IntervalResponse = {
    id: number,
    day_of_week: number,
    starts_at: string,
    ends_at: string
}

export const toIntervalResponse = (row: IntervalRow): IntervalResponse => ({
    id: Number(row.id),
    day_of_week: Number(row.day_of_week),
    starts_at: row.starts_at.slice(0, 5),
    ends_at: row.ends_at.slice(0, 5)
})