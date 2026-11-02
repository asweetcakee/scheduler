import type { ISODate } from '../../schemas/scheduleSchema'
import { addCalendarDays, formatCalendarDate } from '../../utils/calendarDate'

type CalendarToolbarProps = {
    date: ISODate,
    today: ISODate,
    onDateChange: (date: ISODate) => void
}

export const CalendarToolbar = ({ date, today, onDateChange }: CalendarToolbarProps) => {
    return (
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
                <div className='flex items-center justify-between gap-2'>
                    <label htmlFor='calendar-date' className='text-sm font-medium'>Дата</label>
                    <span className='text-sm font-semibold text-text-secondary'>
                        {formatCalendarDate(date)}
                    </span>

                    <button
                        type='button'
                        onClick={() => onDateChange(today)}
                        disabled={date === today}
                        className='text-sm font-semibold text-accent-purple hover:text-accent-purple-hover hover:cursor-pointer disabled:opacity-0'
                    >
                        Сегодня
                    </button>
                </div>

                <div className='flex items-center justify-between gap-2'>
                    <button
                        type='button'
                        aria-label='Предыдущий день'
                        title='Предыдущий день'
                        onClick={() => onDateChange(addCalendarDays(date, -1))}
                        className='flex px-4 py-1 items-center justify-center rounded-lg bg-accent-purple hover:bg-accent-purple-hover text-text-alt font-semibold cursor-pointer transition-colors'
                    >
                        ‹
                    </button>

                    <input
                        id='calendar-date'
                        type='date'
                        value={date}
                        onChange={(e) => {
                            const value = e.currentTarget.value

                            if (value) {
                                onDateChange(value as ISODate)
                            }
                        }}
                        className='min-w-0 px-3 py-1.5 rounded-lg bg-accent-purple text-row-alt text-sm text-center [&::-webkit-calendar-picker-indicator]:invert focus:bg-accent-purple-hover focus:outline-none transition-colors'
                    />

                    <button
                        type='button'
                        aria-label='Следующий день'
                        title='Следующий день'
                        onClick={() => onDateChange(addCalendarDays(date, 1))}
                        className='flex px-4 py-1 items-center justify-center rounded-lg bg-accent-purple hover:bg-accent-purple-hover text-text-alt font-semibold cursor-pointer transition-colors'
                    >
                        ›
                    </button>
                </div>
            </div>
        </header>
    )
}