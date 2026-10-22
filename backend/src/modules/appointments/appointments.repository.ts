import type { PoolClient } from 'pg'
import type { AppointmentBody, Duration, ID, Price, TimeStampTZ } from '../../schemas/appointmentSchema.js'
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

export type SnapshotPatch = Partial<Snapshot>

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

type AppointmentTargets = {
    client_id: ID,
    master_id: ID,
    service_id: ID
}

const APPOINTMENT_COLUMNS = `
    id, client_id, master_id, service_id,
    starts_at, ends_at, duration, price, status, created_at
`

const JOINED_SELECT = `
    SELECT
        a.id, a.client_id, a.master_id, a.service_id,
        a.starts_at, a.ends_at, a.duration, a.price, a.status, a.created_at,
        s.client_name, s.client_phone,
        s.master_name, s.master_phone, s.master_active_at_booking,
        s.service_name, s.service_default_price, s.service_default_duration
    FROM appointments a
    JOIN appointment_snapshots s ON s.appointment_id = a.id
    WHERE a.id = $1
`

const toWriteError = (error: unknown, data: AppointmentTargets): unknown => {
    if (isExclusionViolation(error)) {
        switch (getConstraintName(error)) {
            case 'appointments_master_no_overlap':
                return new ConflictError('Master already has an appointment at this time')
            case 'appointments_client_no_overlap':
                return new ConflictError('Client already has an appointment at this time')
            default:
                return new ConflictError('Appointment overlaps with an existing one')
        }
    }
    if (isForeignKeyViolation(error)) {
        switch (getConstraintName(error)) {
            case 'appointments_client_id_fkey':
                return new NotFoundError(`Client with id ${data.client_id} not found`)
            case 'appointments_master_id_fkey':
                return new NotFoundError(`Master with id ${data.master_id} not found`)
            case 'appointments_service_id_fkey':
                return new NotFoundError(`Service with id ${data.service_id} not found`)
        }
    }
    return error
}

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
    data: AppointmentBody,
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
        throw toWriteError(error, data)
    }
}

export const findAppointmentById = async(id: ID): Promise<AppointmentWithSnapshotRow | null> => {
    const result = await pool.query<AppointmentWithSnapshotRow>(JOINED_SELECT, [id])
    return result.rows[0] ?? null
}

export const findAppointmentByIdTx = async(client: PoolClient, id: ID): Promise<AppointmentWithSnapshotRow | null> => {
    const result = await client.query<AppointmentWithSnapshotRow>(JOINED_SELECT, [id])
    return result.rows[0] ?? null
}

export const lockAppointmentById = async(client: PoolClient, id: ID): Promise<AppointmentRow | null> => {
    const result = await client.query<AppointmentRow>(
        `
        SELECT ${APPOINTMENT_COLUMNS}
        FROM appointments
        WHERE id = $1
        FOR NO KEY UPDATE
        `, [id]
    )
    return result.rows[0] ?? null
}

export const updateAppointment = async(
    client: PoolClient,
    id: ID,
    data: AppointmentBody,
    ends_at: TimeStampTZ
): Promise<AppointmentRow> => {
    try {
        const result = await client.query<AppointmentRow>(
            `
            UPDATE appointments
            SET client_id = $2,
                master_id = $3,
                service_id = $4,
                starts_at = $5,
                ends_at = $6,
                duration = $7,
                price = $8
            WHERE id = $1
            RETURNING ${APPOINTMENT_COLUMNS}
            `, [id, data.client_id, data.master_id, data.service_id, data.starts_at, ends_at, data.duration, data.price]
        )
        const row = result.rows[0]
        if (!row) {
            throw new Error('Appointment update did not return a row')
        }
        return row
    } catch (error) {
        throw toWriteError(error, data)
    }
}

export const updateAppointmentSnapshot = async(
    client: PoolClient,
    appointment_id: ID,
    patch: SnapshotPatch
): Promise<void> => {
    const result = await client.query(
        `
        UPDATE appointment_snapshots
        SET client_name = COALESCE($2::varchar, client_name),
            client_phone = COALESCE($3::varchar, client_phone),
            master_name = COALESCE($4::varchar, master_name),
            master_phone = COALESCE($5::varchar, master_phone),
            master_active_at_booking = COALESCE($6::boolean, master_active_at_booking),
            service_name = COALESCE($7::varchar, service_name),
            service_default_price = COALESCE($8::numeric, service_default_price),
            service_default_duration = COALESCE($9::integer, service_default_duration)
        WHERE appointment_id = $1
        `, [
            appointment_id,
            patch.client?.name ?? null, patch.client?.phone ?? null,
            patch.master?.name ?? null, patch.master?.phone ?? null, patch.master?.active_at_booking ?? null,
            patch.service?.name ?? null, patch.service?.default_price ?? null, patch.service?.default_duration ?? null
        ]
    )
    if ((result.rowCount ?? 0) === 0) {
        throw new Error('Snapshot update affected no rows')
    }
}