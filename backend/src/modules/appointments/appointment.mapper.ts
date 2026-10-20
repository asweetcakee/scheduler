import type { Duration, ID, Price, TimeStampTZ } from '../../schemas/appointmentSchema.js'
import type { AppointmentRow, AppointmentStatus, Snapshot, SnapshotRow } from './appointments.repository.js'

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

export const toAppointmentResponse = (
    appointment: AppointmentRow,
    snapshot: SnapshotRow
): AppointmentResponse => ({
    id: appointment.id,
    client_id: appointment.client_id,
    master_id: appointment.master_id,
    service_id: appointment.service_id,
    starts_at: appointment.starts_at.toISOString(),
    ends_at: appointment.ends_at.toISOString(),
    duration: appointment.duration,
    price: appointment.price,
    status: appointment.status,
    created_at: appointment.created_at.toISOString(),
    snapshot: {
        client: {
            name: snapshot.client_name,
            phone: snapshot.client_phone
        },
        master: {
            name: snapshot.master_name,
            phone: snapshot.master_phone,
            active_at_booking: snapshot.master_active_at_booking
        },
        service: {
            name: snapshot.service_name,
            default_price: snapshot.service_default_price,
            default_duration: snapshot.service_default_duration
        }
    }
})