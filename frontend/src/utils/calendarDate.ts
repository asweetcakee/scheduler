import { dayAfter, dayBefore, formatDate } from '../hooks/helper'
import type { ISODate } from '../schemas/scheduleSchema'

export const addCalendarDays = (
    date: ISODate,
    amount: number
): ISODate => {
    if (!Number.isInteger(amount)) {
        throw new Error('Amount must be an integer')
    }

    let result = date
    const step = amount < 0 ? -1 : 1

    for (let i = 0; i < Math.abs(amount); i++) {
        result = step < 0
            ? dayBefore(result)
            : dayAfter(result)
    }

    return result
}

export const formatCalendarDate = (date: ISODate): string => {
    const formatted = formatDate(date)
    const [day, month, year] = formatted.split(' ')

    const months: Record<string, string> = {
        янв: 'января',
        февр: 'февраля',
        мар: 'марта',
        апр: 'апреля',
        мая: 'мая',
        июн: 'июня',
        июл: 'июля',
        авг: 'августа',
        сент: 'сентября',
        окт: 'октября',
        нояб: 'ноября',
        дек: 'декабря'
    }

    return `${Number(day)} ${months[month] ?? month} ${year}`
}

export const getCalendarMonthStart = (date: ISODate): ISODate => {
    return `${date.slice(0, 7)}-01` as ISODate
}

export const addCalendarMonths = (
    date: ISODate,
    amount: number
): ISODate => {
    if (!Number.isInteger(amount)) {
        throw new Error('Amount must be an integer')
    }

    const [year, month] = date.split('-').map(Number)
    const totalMonths = year * 12 + (month - 1) + amount

    const nextYear = Math.floor(totalMonths / 12)
    const nextMonth = totalMonths - nextYear * 12 + 1

    return `${String(nextYear).padStart(4, '0')}-${String(nextMonth).padStart(2, '0')}-01` as ISODate
}