import type { DayNumber } from '../components/masters/schedule/constants'
import type { ScheduleIntervalResponse } from '../types/schedule'

export const groupIntervalsByDay = (intervals: ScheduleIntervalResponse[]): Record<DayNumber, ScheduleIntervalResponse[]> => {
    const grouped: Record<DayNumber, ScheduleIntervalResponse[]> = {
        1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
    }
    for (const interval of intervals){
        grouped[interval.day_of_week as DayNumber].push(interval)
    }
    return grouped
}