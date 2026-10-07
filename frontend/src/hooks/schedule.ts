import { useQuery } from '@tanstack/react-query'
import type { ID, ISODate } from '../schemas/scheduleSchema'
import { getVersionForDate } from '../api/schedule'
import { getToday } from './helper'

export const useVersionForDate = (masterId: ID, date: ISODate = getToday()) => {
    return useQuery({
        queryKey: ['schedule', masterId, date],
        queryFn: () => getVersionForDate(masterId, date),
        enabled: Boolean(masterId)
    })
}