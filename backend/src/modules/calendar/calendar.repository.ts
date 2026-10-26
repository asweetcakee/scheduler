import { pool } from '../../db/pool.js'
import type { Duration, ID, Price } from '../../schemas/appointmentSchema.js'
import type { ISODate } from '../../schemas/calendarSchema.js'
import type { ClientName } from '../../schemas/clientSchema.js'
import type { MasterName } from '../../schemas/masterSchema.js'
import type { ServiceName } from '../../schemas/serviceSchema.js'
import type { AppointmentStatus } from '../appointments/appointments.repository.js'

export type CalendarMasterRow = {
    id: ID,
    name: MasterName,
    active: boolean
}

export type CalendarIntervalRow = {
    master_id: ID,
    start_minutes: number,
    end_minutes: number
}

export type CalendarAppointmentRow = {
    id: ID,
    master_id: ID,
    client_id: ID,
    service_id: ID,
    client_name: ClientName,
    service_name: ServiceName,
    starts_at: Date,
    ends_at: Date,
    duration: Duration,
    price: Price,
    status: AppointmentStatus,
    start_minutes: number,
    end_minutes: number
}

export const findMasters = async (): Promise<CalendarMasterRow[]> => {
    const result = await pool.query<CalendarMasterRow>(
        `
        SELECT id, name, active
        FROM masters
        ORDER BY name, id
        `
    )
    return result.rows
}

// copies findVersionForDate, findWorkingIntervals, findAvailableMasters queries, 
// if version rules change must edit all these 4 queries
export const findWorkingIntervals = async (date: ISODate): Promise<CalendarIntervalRow[]> => {
    const result = await pool.query<CalendarIntervalRow>(
        `
        WITH effective AS (
            SELECT DISTINCT ON (v.master_id) v.master_id, v.id AS version_id
            FROM master_schedule_versions v
            WHERE v.effective_from <= $1::date
            ORDER BY v.master_id, v.effective_from DESC
        )
        SELECT e.master_id,
               (EXTRACT(EPOCH FROM i.starts_at) / 60)::int AS start_minutes,
               (EXTRACT(EPOCH FROM i.ends_at) / 60)::int AS end_minutes
        FROM effective e
        JOIN master_schedule_intervals i ON i.schedule_version_id = e.version_id
        WHERE i.day_of_week = EXTRACT(ISODOW FROM $1::date)
        ORDER BY e.master_id, i.starts_at
        `, [date]
    )
    return result.rows
}

export const findAppointments = async (
    date: ISODate,
    time_zone: string
): Promise<CalendarAppointmentRow[]> => {
    const result = await pool.query<CalendarAppointmentRow>(
        `
        SELECT a.id, a.master_id, a.client_id, a.service_id,
               s.client_name, s.service_name,
               a.starts_at, a.ends_at, a.duration, a.price, a.status,
               FLOOR(EXTRACT(EPOCH FROM (
                   (a.starts_at AT TIME ZONE $2::text) - $1::date::timestamp
               )) / 60)::int AS start_minutes,
               LEAST(1440, CEIL(EXTRACT(EPOCH FROM (
                   (a.ends_at AT TIME ZONE $2::text) - $1::date::timestamp
               )) / 60))::int AS end_minutes
        FROM appointments a
        JOIN appointment_snapshots s ON s.appointment_id = a.id
        WHERE a.starts_at >= ($1::date::timestamp AT TIME ZONE $2::text)
          AND a.starts_at <  (($1::date + 1)::timestamp AT TIME ZONE $2::text)
        ORDER BY a.starts_at, a.id
        `, [date, time_zone]
    )
    return result.rows
}