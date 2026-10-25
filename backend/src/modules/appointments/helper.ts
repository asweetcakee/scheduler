import type { Duration, TimeStampTZ } from '../../schemas/appointmentSchema.js'
import type { DayOfWeek, ISODate } from '../../schemas/scheduleSchema.js'

const BUSINESS_TIME_ZONE = 'Asia/Almaty'

const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    weekday: 'short',
    hour: '2-digit', minute: '2-digit',
    hourCycle: 'h23'
})

export type BusinessLocal = {
    date: ISODate,
    dayOfWeek: DayOfWeek,
    minutes: number
}

const ISO_WEEKDAY: Record<string, DayOfWeek> = {
    Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7
}

// Converts a point in time into the business date, day of week and minutes from midnight based on the salon's time zone Almaty
export const toBusinessLocal = (instant: Date): BusinessLocal => {
    const parts = Object.fromEntries(formatter.
        formatToParts(instant)
        .map(part => [part.type, part.value])
    )
    const { year, month, day, weekday, hour, minute } = parts
    const dayOfWeek = weekday ? ISO_WEEKDAY[weekday] : undefined

    if (!year || !month || !day || !hour || !minute || !dayOfWeek) {
        throw new Error('Failed to format date in business time zone')
    }
    return {
        date: `${year.padStart(4, '0')}-${month}-${day}`,
        dayOfWeek,
        minutes: Number(hour) * 60 + Number(minute)
    }
}

export const timeToMinutes = (time: string): number => {
    const [h = 0, m = 0] = time.split(':').map(Number)
    return h * 60 + m
}

export const minutesToTime = (minutes: number): string =>
    `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

export const calculateEndsAt = ({ starts_at, duration }: { starts_at: TimeStampTZ, duration: Duration }): TimeStampTZ => {
    const startsAt = new Date(starts_at)
    return new Date(startsAt.getTime() + duration * 1000).toISOString()
}