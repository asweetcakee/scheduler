import { FormProvider, useForm } from 'react-hook-form'
import { dayAfter } from '../../../hooks/helper'
import { makeScheduleFormSchema, type ISODate } from '../../../schemas/scheduleSchema'
import { DAYS } from './constants'
import { groupIntervalsByDay, toBody } from '../../../utils/scheduleIntervals'
import type { ScheduleFormValues, UpdateVersionBody } from '../../../types/schedule'
import { DayRow } from './DayRow'
import { zodResolver } from '@hookform/resolvers/zod'

type VersionEditorProps = {
    initial: UpdateVersionBody,
    takenDates: ISODate[],
    today: ISODate,
    isSubmitting: boolean,
    serverError?: string | null,
    onSubmit: (data: UpdateVersionBody) => void
}

export const VersionEditor = ({initial, takenDates, today, isSubmitting, serverError, onSubmit }: VersionEditorProps) => {
    const methods = useForm<ScheduleFormValues>({
        resolver: zodResolver(makeScheduleFormSchema(today, takenDates)),
        mode: 'onChange',
        defaultValues: {
            effective_from: initial.effective_from,
            intervals: groupIntervalsByDay(initial.intervals)
        }
    })
    
    const { register, handleSubmit, formState: { errors } } = methods
    const tomorrow = dayAfter(today)
    
    return(
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(values => onSubmit(toBody(values)))} className='flex flex-col gap-2 max-w-110 w-full'>
                <div className='flex flex-col'>
                    <div className='flex gap-2'>
                        <span className='w-32 px-2 py-1 text-text-secondary text-sm'>Дата вступления:</span>
                        <input
                            {...register('effective_from')}
                            type='date'
                            min={tomorrow}
                            className='px-2 py-1 text-sm font-bold text-text-data border-b justify-center'
                        />
                    </div>
                    {errors.effective_from && <span className='px-2 text-xs text-danger'>{errors.effective_from.message}</span>}
                </div>
                <div className='flex flex-col gap-1'>
                    {DAYS.map(day => (
                        <DayRow key={day} day={day} />
                    ))}
                </div>
                {serverError && <p className='text-sm text-danger'>{serverError}</p>}
                <button
                    type='submit'
                    disabled={isSubmitting}
                    className='inline-flex px-4 py-2 items-center justify-center bg-accent-purple hover:bg-accent-purple-hover text-text-alt rounded-md text-sm font-semibold transition-colors cursor-pointer'
                    >
                        Сохранить
                </button>
            </form>
        </FormProvider>
    )
}