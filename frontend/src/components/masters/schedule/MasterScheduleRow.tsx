import { useMemo } from 'react'
import { useVersionForDate } from '../../../hooks/schedule'
import type { Master } from '../../../types/master'
import type { ScheduleIntervalResponse } from '../../../types/schedule'
import { DAYS, type DayNumber } from './constants'
import { useNavigate } from 'react-router-dom'

type ScheduleRowProps = {
    master: Pick<Master, 'id' | 'name'>
}

export const MasterScheduleRow = ({ master }: ScheduleRowProps) => {
    const navigate = useNavigate()
    const { data: scheduleData, isLoading, error } = useVersionForDate(master.id)
    
    const intervalsByDay = useMemo<Partial<Record<DayNumber, ScheduleIntervalResponse[]>>>(() => {
        if (!scheduleData?.intervals) return {}
        
        return scheduleData.intervals.reduce<Partial<Record<DayNumber, ScheduleIntervalResponse[]>>>((acc, interval) => {
            const day = interval.day_of_week as DayNumber
            if (!acc[day]) acc[day] = []
            acc[day].push(interval)
            return acc
        }, {})
    }, [scheduleData?.intervals])

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

    const handleSelect = () => {
        navigate(`/schedule/${master.id}`)
    }
    
    return(
        <tr
            className='group bg-row-alt even:bg-surface hover:bg-primary-hover hover:text-row-alt transition cursor-pointer'
            onClick={handleSelect}
        >
            <th 
                scope='row' 
                className='px-2 py-3 font-normal text-text group-hover:text-row-alt text-left truncate' title={master.name}>
                {master.name}
            </th>
            {DAYS.map(day => {
                const dayIntervals = intervalsByDay[day] || []
                return (
                    <td key={day} className='px-2 py-3 group-hover:text-row-alt'>
                        {dayIntervals.map(i => `${i.starts_at}-${i.ends_at}`).join(', ') || '-'}
                    </td>
                )
            })}
        </tr>
    )
}