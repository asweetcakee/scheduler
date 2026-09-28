export type Interval = {
    id: number,
    day_of_week: number,
    starts_at: string,
    ends_at: string
}

export type CreateIntervalBody = {
    day_of_week: number,
    starts_at: string,
    ends_at: string
}

export type UpdateIntervalBody = {
    day_of_week?: number,
    starts_at?: string,
    ends_at?: string
}