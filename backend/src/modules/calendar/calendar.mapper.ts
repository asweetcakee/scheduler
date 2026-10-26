import type { Duration, ID, Price, TimeStampTZ } from '../../schemas/appointmentSchema.js'
import type { ISODate } from '../../schemas/calendarSchema.js'
import type { ClientName } from '../../schemas/clientSchema.js'
import type { MasterName } from '../../schemas/masterSchema.js'
import type { ServiceName } from '../../schemas/serviceSchema.js'
import type { AppointmentStatus } from '../appointments/appointments.repository.js'
import type { CalendarAppointmentRow, CalendarIntervalRow, CalendarMasterRow } from './calendar.repository.js'

export type CalendarAppointmentResponse = {
    id: ID
    client_id: ID
    service_id: ID
    client_name: ClientName
    service_name: ServiceName
    starts_at: TimeStampTZ
    ends_at: TimeStampTZ
    duration: Duration
    price: Price
    status: AppointmentStatus
}

export type CalendarIntervalResponse = {
    starts_at: string
    ends_at: string
}

export type CalendarMasterResponse = {
    id: ID
    name: MasterName
    active: boolean
    working_intervals: CalendarIntervalResponse[]
    appointments: CalendarAppointmentResponse[]
}

export type CalendarResponse = {
    date: ISODate
    timezone: string
    time_range: {
        starts_at: string,
        ends_at: string
    } | null
    masters: CalendarMasterResponse[]
}

export const formatMinutes = (minutes: number): string =>
    `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

const toIntervalResponse = (row: CalendarIntervalRow): CalendarIntervalResponse => ({
    starts_at: formatMinutes(row.start_minutes),
    ends_at: formatMinutes(row.end_minutes)
})

const toAppointmentResponse = (row: CalendarAppointmentRow): CalendarAppointmentResponse => ({
    id: row.id,
    client_id: row.client_id,
    service_id: row.service_id,
    client_name: row.client_name,
    service_name: row.service_name,
    starts_at: row.starts_at.toISOString(),
    ends_at: row.ends_at.toISOString(),
    duration: row.duration,
    price: row.price,
    status: row.status
})

export const toCalendarMasterResponse = (
    master: CalendarMasterRow,
    intervals: CalendarIntervalRow[],
    appointments: CalendarAppointmentRow[]
): CalendarMasterResponse => ({
    id: master.id,
    name: master.name,
    active: master.active,
    working_intervals: intervals.map(toIntervalResponse),
    appointments: appointments.map(toAppointmentResponse)
})