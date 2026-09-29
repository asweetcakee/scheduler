import type { DayNumber } from '../components/masters/schedule/constants'
import type { Master } from './master'

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

export type ScheduleFormModalProps = {
    master_id: number,
    master_name: string,
    day: DayNumber,
    onClose: () => void
}

export type SelectedCell = { master: Pick<Master, 'id' | 'name'>, day: DayNumber } | null