import { useEffect, useState } from 'react'
import type { ISODate } from '../../schemas/scheduleSchema'
import { addCalendarDays, addCalendarMonths, formatCalendarDate, getCalendarMonthStart } from '../../utils/calendarDate'

type MiniCalendarProps = {
    date: ISODate
    today: ISODate
    onDateChange: (date: ISODate) => void
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const getMondayOffset = (date: ISODate): number => {
    const [year, month, day] = date.split('-').map(Number)

    const weekday = new Date(
        Date.UTC(year, month - 1, day)
    ).getUTCDay()

    return (weekday + 6) % 7
}

const getMonthLabel = (date: ISODate): string => {
    return new Intl.DateTimeFormat('ru-RU', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
    })
        .format(new Date(`${date}T00:00:00Z`))
        .replace(/\s*г\.?$/u, '')
}

export const MiniCalendar = ({ date, today, onDateChange }: MiniCalendarProps) => {
    const [visibleMonth, setVisibleMonth] = useState<ISODate>(() => getCalendarMonthStart(date))

    // Syncs the displayed month when the selected date changes outside this component
    useEffect(() => {
        const selectedMonth = getCalendarMonthStart(date)
        setVisibleMonth(current =>
            current.slice(0, 7) === selectedMonth.slice(0, 7)
                ? current
                : selectedMonth
        )
    }, [date])

    const firstDayOffset = getMondayOffset(visibleMonth)
    const firstVisibleDay = addCalendarDays(visibleMonth, -firstDayOffset)

    // Always displays six complete weeks
    const days = Array.from({ length: 42 }, (_, index) => addCalendarDays(firstVisibleDay, index))

    return (
        <section
            aria-label='Мини-календарь'
            className='w-60 rounded-lg bg-surface p-3'
        >
            <div className='mb-3 flex items-center justify-between gap-2'>
                <h2 className='text-sm font-semibold text-text capitalize'>
                    {getMonthLabel(visibleMonth)}
                </h2>

                <div className='flex items-center gap-1'>
                    <button
                        type='button'
                        aria-label='Предыдущий месяц'
                        title='Предыдущий месяц'
                        onClick={() => {
                            setVisibleMonth(current =>
                                addCalendarMonths(current, -1)
                            )
                        }}
                        className='flex h-8 w-8 items-center justify-center rounded-lg text-text hover:bg-row-alt transition-colors'
                    >
                        ‹
                    </button>

                    <button
                        type='button'
                        aria-label='Следующий месяц'
                        title='Следующий месяц'
                        onClick={() => {
                            setVisibleMonth(current =>
                                addCalendarMonths(current, 1)
                            )
                        }}
                        className='flex h-8 w-8 items-center justify-center rounded-lg text-text hover:bg-row-alt transition-colors'
                    >
                        ›
                    </button>
                </div>
            </div>

            <div className='grid grid-cols-7 gap-1'>
                {WEEKDAYS.map((weekday) => (
                    <div
                        key={weekday}
                        className='flex h-8 items-center justify-center text-xs font-medium text-text-secondary'
                        aria-label={weekday}
                    >
                        {weekday}
                    </div>
                ))}

                {days.map(day => {
                    const isSelected = day === date
                    const isToday = day === today
                    const isCurrentMonth =
                        day.slice(0, 7) === visibleMonth.slice(0, 7)

                    return (
                        <button
                            key={day}
                            type='button'
                            aria-label={formatCalendarDate(day)}
                            aria-pressed={isSelected}
                            aria-current={isToday ? 'date' : undefined}
                            title={formatCalendarDate(day)}
                            onClick={() => onDateChange(day)}
                            className={`
                                flex aspect-square w-full items-center justify-center
                                rounded-lg text-sm transition-colors
                                ${isSelected
                                    ? 'bg-accent-purple text-text-alt font-semibold'
                                    : isToday
                                        ? 'border border-accent-purple text-accent-purple font-semibold hover:bg-row-alt'
                                        : isCurrentMonth
                                            ? 'text-text hover:bg-row-alt'
                                            : 'text-text-muted/50 hover:bg-row-alt'
                                }
                            `}
                        >
                            {Number(day.slice(-2))}
                        </button>
                    )
                })}
            </div>
        </section>
    )
}