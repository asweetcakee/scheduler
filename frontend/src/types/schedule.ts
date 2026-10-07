import type { DayOfWeek, ID, ISODate, TimeFormat } from '../schemas/scheduleSchema'

export type ScheduleVersionResponse = {
    id: ID,
    effective_from: ISODate
}

export type ScheduleIntervalResponse = {
    id: ID
    day_of_week: DayOfWeek
    starts_at: TimeFormat
    ends_at: TimeFormat
}

export type ScheduleResponse = {
    version: ScheduleVersionResponse | null
    intervals: ScheduleIntervalResponse[]
}

export type ScheduleResponseDetails = {
    version: ScheduleVersionResponse
    intervals: ScheduleIntervalResponse[]
}

type IntervalBody = {
    day_of_week: DayOfWeek
    starts_at: TimeFormat
    ends_at: TimeFormat
}

export type CreateVersionBody = {
    effective_from: ISODate,
    intervals: IntervalBody[]
}

export type UpdateVersionBody = {
    effective_from: ISODate,
    intervals: IntervalBody[]
}