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
                <div className='flex items-center justify-between text-xs px-0.5'>
                    <span className='font-medium text-text-muted'>Дата</span>
                    <button
                        type='button'
                        onClick={() => onDateChange(today)}
                        disabled={date === today}
                        className='text-accent-purple font-medium hover:underline disabled:opacity-30 disabled:no-underline disabled:cursor-not-allowed transition-all'
                    >
                        Сегодня
                    </button>
                </div>

                <div className='flex items-center justify-between bg-accent-purple/20 rounded-lg gap-1 transition-colors'>
                    <button
                        type='button'
                        aria-label='Предыдущий день'
                        onClick={() => onDateChange(addCalendarDays(date, -1))}
                        className='px-3 py-1 flex items-center justify-center rounded-l-md text-text-muted hover:text-text hover:bg-accent-purple/40 transition-colors cursor-pointer'
                    >
                        ‹
                    </button>

                    <span className='text-sm font-medium text-text select-none'>
                        {formatCalendarDate(date)}
                    </span>

                    <button
                        type='button'
                        aria-label='Следующий день'
                        onClick={() => onDateChange(addCalendarDays(date, 1))}
                        className='px-3 py-1 flex items-center justify-center rounded-r-md text-text-muted hover:text-text hover:bg-accent-purple/40 transition-colors cursor-pointer'
                    >
                        ›
                    </button>
                </div>
            </div>
        </header>
    )
}