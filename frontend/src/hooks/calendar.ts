import { useQuery } from '@tanstack/react-query'
import type { ISODate } from '../schemas/scheduleSchema'
import { getCalendar } from '../api/calendar'

export const useCalendar = (date: ISODate) => {
    return useQuery({
        queryKey: ['calendar', date],
        queryFn: () => getCalendar(date),
        enabled: Boolean(date)
    })
}