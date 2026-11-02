import { useState } from 'react'
import { useCalendar } from '../hooks/calendar'
import { CalendarLayout } from '../layout/CalendarLayout'
import type { ISODate } from '../schemas/scheduleSchema'
import { useToday } from '../hooks/useToday'
import { CalendarToolbar } from '../components/calendar/CalendarToolbar'

export const CalendarPage = () => {
    const today = useToday()
    const [date, setDate] = useState<ISODate>(today)
    const { data: calendar, isPending, isFetching, isError, error } = useCalendar(date)
    
    return (
    <section className='flex w-full flex-col gap-3'>
        <CalendarToolbar date={date} today={today} onDateChange={setDate}/>

        {isFetching && !isPending && (
            <p className='text-sm text-text-data' role='status'>
                Обновление календаря...
            </p>
        )}

        {isPending ? (
            <div
                className='flex mx-4 min-h-64 items-center justify-center bg-surface rounded-lg'
                role='status'
            >
                <p className='text-sm text-text-data'>
                    Загрузка календаря...
                </p>
            </div>
        ) : isError ? (
            <div
                className='mx-4 bg-surface rounded-lg'
                role='alert'
            >
                <p className='font-medium text-danger'>
                    Не удалось загрузить календарь
                </p>
                <p className='mt-1 text-sm text-text-muted'>
                    {error instanceof Error
                        ? error.message
                        : 'Произошла неизвестная ошибка'}
                </p>
            </div>
        ) : calendar.masters.length === 0 ? (
            <div className='flex mx-4 min-h-64 items-center justify-center bg-surface rounded-lg'>
                <p className='text-sm text-text-data'>
                    На выбранную дату нет расписания.
                </p>
            </div>
        ) : (
            <CalendarLayout calendar={calendar} />
        )}
    </section>
    )
}