import type { PoolClient } from 'pg'
import type { CreateAppointmentBody, Duration, ID, Price, TimeStampTZ } from '../../schemas/appointmentSchema.js'
import type { ClientName, ClientPhone } from '../../schemas/clientSchema.js'
import type { MasterName, MasterPhone } from '../../schemas/masterSchema.js'
import type { DayOfWeek, ISODate } from '../../schemas/scheduleSchema.js'
import type { ServiceName } from '../../schemas/serviceSchema.js'
import { getConstraintName, isExclusionViolation, isForeignKeyViolation } from '../../errors/pgErrorCodes.js'
import { ConflictError } from '../../errors/ConflictError.js'
import { NotFoundError } from '../../errors/NotFoundError.js'
import { pool } from '../../db/pool.js'

type ClientSnapshot = {
    name: ClientName,
    phone: ClientPhone
}

type MasterSnapshot = {
    name: MasterName,
    phone: MasterPhone,
    active_at_booking: boolean
}

type ServiceSnapshot = {
    name: ServiceName,
    default_price: Price,
    default_duration: Duration
}

export type Snapshot = {
    client: ClientSnapshot,
    master: MasterSnapshot,
    service: ServiceSnapshot
}

export type SnapshotRow = {
    client_name: ClientName,
    client_phone: ClientPhone,
    master_name: MasterName,
    master_phone: MasterPhone,
    master_active_at_booking: boolean,
    service_name: ServiceName,
    service_default_price: Price,
    service_default_duration: Duration
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled'

export type AppointmentRow = {
    id: ID,
    client_id: ID,
    master_id: ID,
    service_id: ID,
    starts_at: Date,
    ends_at: Date,
    duration: Duration,
    price: Price,
    status: AppointmentStatus,
    created_at: Date
}

export type AppointmentWithSnapshotRow = AppointmentRow & SnapshotRow

export type WorkingInterval = {
    starts_at: string,
    ends_at: string
}

export const findWorkingIntervals = async(
    client: PoolClient,
    master_id: ID,
    date: ISODate,
    day_of_week: DayOfWeek
): Promise<WorkingInterval[]> => {
    const result = await client.query<WorkingInterval>(
        `
        SELECT i.starts_at::text AS starts_at, i.ends_at::text AS ends_at
        FROM master_schedule_intervals i
        WHERE i.day_of_week = $3
          AND i.schedule_version_id = (
              SELECT v.id
              FROM master_schedule_versions v
              WHERE v.master_id = $1 AND v.effective_from <= $2
              ORDER BY v.effective_from DESC
              LIMIT 1
          )
        ORDER BY i.starts_at
        `, [master_id, date, day_of_week]
    )

    return result.rows
}

export const createAppointmentSnapshot = async(
    client: PoolClient,
    appointment_id: ID,
    snapshot: Snapshot
): Promise<SnapshotRow> => {
    const result = await client.query<SnapshotRow>(
        `
        INSERT INTO appointment_snapshots 
            (   
                appointment_id,
                client_name, client_phone,
                master_name, master_phone, master_active_at_booking,
                service_name, service_default_price, service_default_duration
            )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING 
            client_name, client_phone,
            master_name, master_phone, master_active_at_booking,
            service_name, service_default_price, service_default_duration
        `, [
            appointment_id,
            snapshot.client.name, snapshot.client.phone,
            snapshot.master.name, snapshot.master.phone, snapshot.master.active_at_booking,
            snapshot.service.name, snapshot.service.default_price, snapshot.service.default_duration
        ]
    )
    const row = result.rows[0]
    if (!row) {
        throw new Error('Snapshot insert did not return a row')
    }
    return row
}

export const createAppointment = async (
    client: PoolClient,
    data: CreateAppointmentBody,
    ends_at: TimeStampTZ
): Promise<AppointmentRow> => {
    try {
        const result = await client.query<AppointmentRow>(
            `
            INSERT INTO appointments (client_id, master_id, service_id, starts_at, ends_at, duration, price)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, client_id, master_id, service_id, starts_at, ends_at, duration, price, status, created_at
            `, [data.client_id, data.master_id, data.service_id, data.starts_at, ends_at, data.duration, data.price]
        )
        const row = result.rows[0]
        if (!row) {
            throw new Error('Appointment insert did not return a row')
        }
        return row
    } catch (error) {
        if (isExclusionViolation(error)) {
            switch (getConstraintName(error)) {
                case 'appointments_master_no_overlap':
                    throw new ConflictError('Master already has an appointment at this time')
                case 'appointments_client_no_overlap':
                    throw new ConflictError('Client already has an appointment at this time')
                default:
                    throw new ConflictError('Appointment overlaps with an existing one')
            }
        }
        if (isForeignKeyViolation(error)) {
            switch (getConstraintName(error)) {
                case 'appointments_client_id_fkey':
                    throw new NotFoundError(`Client with id ${data.client_id} not found`)
                case 'appointments_master_id_fkey':
                    throw new NotFoundError(`Master with id ${data.master_id} not found`)
                case 'appointments_service_id_fkey':
                    throw new NotFoundError(`Service with id ${data.service_id} not found`)
            }
        }
        throw error
    }
}

export const findAppointmentById = async(id: ID): Promise<AppointmentWithSnapshotRow | null> => {
    const result = await pool.query<AppointmentWithSnapshotRow>(
        `
        SELECT
            a.id, a.client_id, a.master_id, a.service_id, 
            a.starts_at, a.ends_at, a.duration, a.price, a.status, a.created_at,
            s.client_name, s.client_phone,
            s.master_name, s.master_phone, s.master_active_at_booking,
            s.service_name, s.service_default_price, s.service_default_duration
        FROM appointments a
        JOIN appointment_snapshots s ON s.appointment_id = a.id
        WHERE a.id = $1
        `, [id]
    )
    return result.rows[0] ?? null
}