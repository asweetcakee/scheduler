import { useFormContext } from 'react-hook-form'
import type { ScheduleFormValues } from '../../../types/schedule'
import type { DayNumber } from './constants'

type IntervalRowProps = {
    day: DayNumber
    index: number
    onRemove: () => void
}

export const IntervalRow = ({ day, index, onRemove }: IntervalRowProps) => {
    const { register, formState: { errors } } = useFormContext<ScheduleFormValues>()
    const rowErrors = errors.intervals?.[day]?.[index]
    const errorMessage = rowErrors?.starts_at?.message ?? rowErrors?.ends_at?.message

    const inputClass = (hasError: boolean) =>
        `px-2 py-1 text-sm rounded-lg bg-page outline-none border ${
            hasError ? 'border-danger' : 'border-transparent'
        }`
    return(
        <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
                <input
                    {...register(`intervals.${day}.${index}.starts_at`)}
                    type='time'
                    className={inputClass(Boolean(rowErrors?.starts_at))}
                />
                <span className='py-1'>-</span>
                <input
                    {...register(`intervals.${day}.${index}.ends_at`)}
                    type='time'
                    className={inputClass(Boolean(rowErrors?.ends_at))}
                />
                <button
                    type='button'
                    onClick={onRemove}
                    className='px-3 py-1 bg-danger hover:bg-danger-hover text-text-alt text-sm rounded-lg transition-colors cursor-pointer'
                >
                    x
                </button>
            </div>
            {errorMessage && <span className='text-xs text-danger'>{errorMessage}</span>}
        </div>
    )
}