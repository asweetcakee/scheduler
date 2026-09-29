import { useForm } from 'react-hook-form'
import { useCreateInterval, useRemoveInterval, useUpdateInterval } from '../../../hooks/schedule'
import { intervalFormSchema, type IntervalForm } from '../../../schemas/scheduleSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Interval } from '../../../types/schedule'
import type { DayNumber } from './constants'

type IntervalRowProps = {
    master_id: number,
    day: DayNumber
    interval?: Interval,
    onCreated?: () => void,
    onCancel?: () => void
}

export const IntervalRow = ({ master_id, interval, day, onCreated, onCancel }: IntervalRowProps) => {
    const createMutation = useCreateInterval(master_id)
    const updateMutation = useUpdateInterval(master_id)
    const removeMutation = useRemoveInterval(master_id)
    
    const { 
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty }
     } = useForm<IntervalForm>({
        resolver: zodResolver(intervalFormSchema),
        defaultValues: {
            starts_at: interval?.starts_at ?? '',
            ends_at: interval?.ends_at ?? ''
        }
    })

    const onSubmit = (values: IntervalForm) => {
        if (interval) {
            updateMutation.mutate(
                { interval_id: interval.id, data: values },
                { onSuccess: () => reset(values) }
            )
        } else {
            createMutation.mutate(
                { day_of_week: day, ...values },
                { onSuccess: () => onCreated?.() }
            )
        }
        
    }

    const handleDelete = () => {
        if (!interval) return
        if (window.confirm(`Удалить интервал ${interval.starts_at}–${interval.ends_at}?`)) {
            removeMutation.mutate(interval.id)
        }
    }
    
    const isPending = createMutation.isPending || updateMutation.isPending

    return(
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
                <div>
                    <input 
                        {...register('starts_at')}
                        type='time'
                        className='px-2 py-1 rounded-lg bg-page outline-none'
                    />
                    {errors.starts_at && <span className='text-danger text-sm'>{errors.starts_at.message}</span>}
                </div>
                <span>–</span>
                <div>
                    <input 
                        {...register('ends_at')}
                        type='time'
                        className='px-2 py-1 rounded-lg bg-page outline-none'
                    />
                    {errors.ends_at && <span className='text-danger text-sm'>{errors.ends_at.message}</span>}
                </div>
                <button
                    type='submit'
                    disabled={!isDirty || isPending}
                    className='px-2 py-1 bg-accent-purple hover:bg-accent-purple-hover text-text-alt text-sm rounded-lg transition-colors disabled:opacity-50'
                >
                    {isPending ? 'Сохранение...' : 'Сохранить'}
                </button>
                
                {interval ? (
                    <button
                        type='button'
                        onClick={handleDelete}
                        disabled={removeMutation.isPending}
                        className='px-2 py-1 bg-danger hover:bg-danger-hover text-text-alt text-sm rounded-lg transition-colors'>
                        Удалить
                    </button>
                ) : (
                    <button 
                        type='button'
                        onClick={onCancel}
                        className='px-2 py-1 text-sm rounded-lg bg-page hover:bg-status-pending hover:text-text-alt transition-colors'>
                        Отмена
                    </button>
                )}
            </div>
            {createMutation.error && (
                <span className='text-danger text-sm'>
                    {createMutation.error.message}
                </span>
            )}
            {updateMutation.error && (
                <span className='text-danger text-sm'>
                    {updateMutation.error.message}
                </span>
            )}
            {removeMutation.error && (
                <span className='text-danger text-sm'>
                    {removeMutation.error.message}
                </span>
            )}
        </form>
    )
}