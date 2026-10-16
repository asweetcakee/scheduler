import type { ScheduleIntervalResponse } from '../../../types/schedule'
import { groupIntervalsByDay } from '../../../utils/scheduleIntervals'
import { dayLabels, DAYS } from './constants'

export const WeekSchedule = ({ intervals }: { intervals: ScheduleIntervalResponse[] }) => {
    const byDay = groupIntervalsByDay(intervals)
    return (
        <div className='flex flex-col gap-2 max-w-2xl'>
            {DAYS.map(day => (
                <div
                    key={day}
                    className='flex items-center px-2 py-1 rounded-md hover:bg-accent-blue-hover/20 transition-colors'
                >
                    <span className='w-32 font-medium text-sm text-text-data shrink-0'>
                        {dayLabels[day]}
                    </span>
                    <div className='flex items-center gap-2 flex-wrap'>
                        {byDay[day].length === 0 && (
                            <span className='text-sm text-text-secondary/60 italic'>
                                Выходной
                            </span>
                        )}
                        {byDay[day].map(interval => (
                            <span
                                key={interval.id}
                                className='px-3 py-1 bg-accent-blue/30 text-text-data text-sm font-medium rounded-md'
                            >
                                {interval.starts_at} – {interval.ends_at}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )    
}