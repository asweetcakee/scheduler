import type { AppointmentStatus } from './appointment'

type CalendarIntervalResponse = {
    starts_at: string,
    ends_at: string
}

type CalendarAppointmentResponse = {
    id: number,
    client_id: number,
    service_id: number,
    client_name: string,
    service_name: string,
    starts_at: string,
    ends_at: string,
    duration: number,
    price: string,
    status: AppointmentStatus,
    start_minutes: number,
    end_minutes: number
}

type CalendarMasterResponse = {
    id: number,
    name: string,
    active: boolean,
    working_intervals: CalendarIntervalResponse[],
    appointments: CalendarAppointmentResponse[]
}

export type CalendarResponse = {
    date: string,
    timezone: string,
    time_range: {
        starts_at: string,
        ends_at: string
    } | null,
    masters: CalendarMasterResponse[]
}