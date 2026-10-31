import { useState } from 'react'
import { useCalendar } from '../hooks/calendar'
import { CalendarLayout } from '../layout/CalendarLayout'
import type { ISODate } from '../schemas/scheduleSchema'
import { useToday } from '../hooks/useToday'

export const CalendarPage = () => {
    const today = useToday()
    const [date, setDate] = useState<ISODate>(today)
    const { data: calendar, isPending, isFetching, isError, error } = useCalendar(date)
    
    return (
    <section className='flex w-full flex-col gap-3'>
        <header className='flex flex-col gap-2 mx-4 mt-6 px-4 py-4 bg-surface sm:flex-row sm:items-center sm:justify-between rounded-lg'>
            <div className='flex flex-col gap-1'>
                <h1 className='text-2xl text-text font-semibold tracking-tight'>
                    Календарь
                </h1>
                <p className='text-sm text-text-secondary'>
                    Расписание мастеров и записи клиентов
                </p>
            </div>

            <div className='flex flex-col gap-1.5'>
                <label htmlFor='calendar-date' className='text-sm font-medium'>Дата</label>
                <input
                    id='calendar-date'
                    type='date'
                    value={date}
                    onChange={(event) => setDate(event.currentTarget.value)}
                    className='px-3 py-2 border rounded-lg bg-surface text-sm'
                />
            </div>
        </header>

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