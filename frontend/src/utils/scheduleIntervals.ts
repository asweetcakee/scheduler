import { DAYS, type DayNumber } from '../components/masters/schedule/constants'
import type { IntervalBody, ScheduleFormValues, UpdateVersionBody } from '../types/schedule'

export const groupIntervalsByDay = <T extends IntervalBody>(intervals: T[]): Record<DayNumber, T[]> => {
    const grouped: Record<DayNumber, T[]> = {
        1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
    }
    for (const interval of intervals){
        grouped[interval.day_of_week as DayNumber].push(interval)
    }
    return grouped
}

export const toBody = (values: ScheduleFormValues): UpdateVersionBody => ({
    effective_from: values.effective_from,
    intervals: DAYS.flatMap(day => values.intervals[day])
})