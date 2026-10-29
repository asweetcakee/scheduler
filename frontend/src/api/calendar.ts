import type { ISODate } from '../schemas/scheduleSchema'
import type { CalendarResponse } from '../types/calendar'
import { handleResponse } from './handleResponse'

const baseUrl = '/api/calendar'

export const getCalendar = async (date: ISODate): Promise<CalendarResponse> => {
    const params = new URLSearchParams()
    params.set('date', date)
    
    const response = await fetch(`${baseUrl}?${params}`)
    return handleResponse<CalendarResponse>(response)
}