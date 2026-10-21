import type { Duration, ID, Price, TimeStampTZ } from '../../schemas/appointmentSchema.js'
import type { AppointmentStatus, AppointmentWithSnapshotRow, Snapshot, SnapshotRow } from './appointments.repository.js'

export type AppointmentResponse = {
    id: ID
    client_id: ID
    master_id: ID
    service_id: ID
    starts_at: TimeStampTZ
    ends_at: TimeStampTZ
    duration: Duration
    price: Price
    status: AppointmentStatus
    created_at: TimeStampTZ
    snapshot: Snapshot
}

export const toAppointmentResponse = (row: AppointmentWithSnapshotRow): AppointmentResponse => ({
    id: row.id,
    client_id: row.client_id,
    master_id: row.master_id,
    service_id: row.service_id,
    starts_at: row.starts_at.toISOString(),
    ends_at: row.ends_at.toISOString(),
    duration: row.duration,
    price: row.price,
    status: row.status,
    created_at: row.created_at.toISOString(),
    snapshot: {
        client: {
            name: row.client_name,
            phone: row.client_phone
        },
        master: {
            name: row.master_name,
            phone: row.master_phone,
            active_at_booking: row.master_active_at_booking
        },
        service: {
            name: row.service_name,
            default_price: row.service_default_price,
            default_duration: row.service_default_duration
        }
    }
})