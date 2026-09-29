import { useSchedule } from '../../../hooks/schedule'
import type { Master } from '../../../types/master'
import type { SelectedCell } from '../../../types/schedule'
import { DAYS, type DayNumber } from './constants'

type ScheduleRowProps = {
    master: Pick<Master, 'id' | 'name'>,
    onSelectedDay: (selected: SelectedCell) => void
}

export const MasterScheduleRow = ({ master, onSelectedDay }: ScheduleRowProps) => {
    const { data: intervals, isLoading, error } = useSchedule(master.id)
    if (isLoading) return(
        <tr>
            <th scope='row' className='px-2 py-3 font-normal text-text text-left truncate' title={master.name}>
                {master.name}
            </th>
            <td colSpan={7} className='px-2 py-3'>Loading...</td>
        </tr>
    )

    if (error) return(
        <tr>
            <th scope='row' className='px-2 py-3 font-normal text-text text-left truncate' title={master.name}>
                {master.name}
            </th>
            <td colSpan={7} className='px-2 py-3'>Error: {error.message}</td>
        </tr>
    )
    
    const byDay = (day: DayNumber) => {
        return intervals?.filter(interval => interval.day_of_week === day) ?? []
    }
    
    return(
        <tr className='bg-row-alt even:bg-surface'>
            <th scope='row' className='px-2 py-3 font-normal text-text text-left truncate' title={master.name}>
                {master.name}
            </th>
            {DAYS.map(day => (
                <td 
                    key={day}
                    className='px-2 py-3 hover:bg-primary-hover hover:text-row-alt transition cursor-pointer'
                    onClick={() => onSelectedDay({ master, day })}
                >
                    { byDay(day).map(interval => `${interval.starts_at}-${interval.ends_at}`).join(', ') || '-' }
                </td>
            ))}
        </tr>
    )
}