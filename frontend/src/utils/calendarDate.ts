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