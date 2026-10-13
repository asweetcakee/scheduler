import { useFieldArray, useFormContext } from 'react-hook-form'
import { dayLabels, type DayNumber } from './constants'
import type { ScheduleFormValues } from '../../../types/schedule'
import { IntervalRow } from './IntervalRow'

type DayRowProps = {
    day: DayNumber
}

export const DayRow = ({ day }: DayRowProps) => {
    const { control } = useFormContext<ScheduleFormValues>()
    const { fields, append, remove } = useFieldArray({
        control,
        name: `intervals.${day}`
    })
    return(
        <div className='flex items-start px-2 py-1 rounded-md hover:bg-accent-blue-hover/20 transition-colors'>
            <span className='w-32 font-medium text-sm text-text-data shrink-0'>
                {dayLabels[day]}
            </span>
            <div className='flex items-center gap-2 flex-wrap'>
                {fields.length === 0 && <span className='text-sm text-text-secondary/60 italic'>Выходной</span>}
                {fields.map((field, index) => (
                    <IntervalRow
                        key={field.id}
                        day={day}
                        index={index}
                        onRemove={() => remove(index)}
                    />
                ))}
                <button
                    type='button'
                    onClick={() => append({ 
                        day_of_week: day,
                        starts_at: '',
                        ends_at: ''
                    })}
                    className='px-2 py-1 text-sm rounded-lg bg-success text-text-alt hover:bg-success-hover transition-colors cursor-pointer'
                >
                    + интервал
                </button>
            </div>
        </div>
    )
}