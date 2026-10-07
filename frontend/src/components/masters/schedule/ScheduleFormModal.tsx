import { useMemo, useState } from 'react'
import type { ScheduleFormModalProps } from '../../../types/schedule'
import { Modal } from '../../shared/Modal'
import { IntervalRow } from './IntervalRow'
import { dayLabels } from './constants'

export const ScheduleFormModal = ({ master_id, master_name, onClose }: ScheduleFormModalProps) => {
    const { data: intervals, isLoading, error } = useSchedule(master_id)
    const [isAdding, setIsAdding] = useState<boolean>(false)
    
    const filteredIntervals = useMemo(() => {
        if (!intervals) return []
        return intervals.filter(interval => interval.day_of_week === day)
    }, [intervals, day])

    return (
        <Modal onClose={onClose}>
            <h2 className='text-lg font-bold mb-4'>{master_name}: {dayLabels[day]}</h2>
            <div className='flex flex-col gap-2'>
                {isLoading && <p className='text-text-muted py-4'>Loading intervals...</p>}
                {filteredIntervals.map(interval => (
                    <IntervalRow
                        key={interval.id}
                        master_id={master_id}
                        day={day}
                        interval={interval}
                    />
                ))}
                {isAdding && (
                    <IntervalRow
                        master_id={master_id}
                        day={day}
                        onCreated={() => setIsAdding(false)}
                        onCancel={() => setIsAdding(false)}
                    />
                )}
                {error && <p className='text-danger py-4'>Error: {error.message}</p>}
                {!isAdding && (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className='bg-accent-purple hover:bg-accent-purple-hover text-text-alt font-medium px-4 py-2 rounded-lg transition-colors'
                    >
                        Добавить
                    </button>
                )}
            </div>
        </Modal>
    )
}