import type { PoolClient } from 'pg'
import { withTransaction } from '../../db/withTransaction.js'
import { NotFoundError } from '../../errors/NotFoundError.js'
import { UnprocessableEntityError } from '../../errors/UnprocessableEntityError.js'
import type { AppointmentBody, ID } from '../../schemas/appointmentSchema.js'
import { findClientByIdForBooking } from '../clients/client.repository.js'
import { lockMasterByIdForBooking } from '../masters/master.repository.js'
import { findServiceByIdForBooking } from '../services/service.repository.js'
import { toAppointmentResponse, type AppointmentResponse } from './appointment.mapper.js'
import * as appointmentRepository from './appointments.repository.js'
import { calculateEndsAt, timeToMinutes, toBusinessLocal, type BusinessLocal } from './helper.js'

// Validates that the appointment fits entirely within a single working interval for a master 422
// Shared between 'create' and 'update'
const assertFitsWorkingInterval = async(
    client: PoolClient,
    master_id: ID,
    start: BusinessLocal,
    end: BusinessLocal
): Promise<void> => {
    if (start.date !== end.date) {
        throw new UnprocessableEntityError('Appointment must start and end on the same day')
    }

    const intervals = await appointmentRepository.findWorkingIntervals(client, master_id, start.date, start.dayOfWeek)
    const fits = intervals.some(interval => 
        timeToMinutes(interval.starts_at) <= start.minutes &&
        end.minutes <= timeToMinutes(interval.ends_at)
    )

    if (!fits) {
        throw new UnprocessableEntityError('Appointment does not fit inside a working interval')
    }
}

export const createAppointment = async (
    data: AppointmentBody
): Promise<AppointmentResponse> => {
    const endsAt = calculateEndsAt(data)
    const start = toBusinessLocal(new Date(data.starts_at))
    const end = toBusinessLocal(new Date(endsAt))
    const today = toBusinessLocal(new Date()).date

    const { appointment, snapshot } = await withTransaction(
        async client => {
            // 404
            const master = await lockMasterByIdForBooking(client, data.master_id)
            if (!master) {
                throw new NotFoundError(`Master with id ${data.master_id} not found`)
            }
            const clientData = await findClientByIdForBooking(client, data.client_id)
            if (!clientData) {
                throw new NotFoundError(`Client with id ${data.client_id} not found`)
            }
            const service = await findServiceByIdForBooking(client, data.service_id)
            if (!service) {
                throw new NotFoundError(`Service with id ${data.service_id} not found`)
            }

            // 422
            if (!master.active) {
                throw new UnprocessableEntityError('Master is inactive')
            }
            if (start.date < today) {
                throw new UnprocessableEntityError('starts_at must not be in the past')
            }
            await assertFitsWorkingInterval(client, data.master_id, start, end)

            // 409 EXCLUDE constraints
            const appointment = await appointmentRepository.createAppointment(client, data, endsAt)
            const snapshot = await appointmentRepository.createAppointmentSnapshot(
                client, appointment.id,
                {
                    client: {
                        name: clientData.name,
                        phone: clientData.phone
                    },
                    master: {
                        name: master.name,
                        phone: master.phone,
                        active_at_booking: master.active
                    },
                    service: {
                        name: service.name,
                        default_price: service.price,
                        default_duration: service.duration
                    }
                }
            )

            return { appointment, snapshot }
        }
    )

    return toAppointmentResponse({
        ...appointment,
        ...snapshot
    })
}

export const findAppointment = async(appointmentId: ID): Promise<AppointmentResponse> => {
    const appointment = await appointmentRepository.findAppointmentById(appointmentId)
    if (!appointment) throw new NotFoundError(`Appointment with id ${appointmentId} not found`)
    return toAppointmentResponse(appointment)
}

export const updateAppointment = async (
    appointmentId: ID,
    data: AppointmentBody
): Promise<AppointmentResponse> => {
    const endsAt = calculateEndsAt(data)
    const start = toBusinessLocal(new Date(data.starts_at))
    const end = toBusinessLocal(new Date(endsAt))
    const today = toBusinessLocal(new Date()).date

    const row = await withTransaction(
        async client => {
            // 404, locks the appointment first, then verifies its current status
            const existing = await appointmentRepository.lockAppointmentById(client, appointmentId)
            if (!existing) {
                throw new NotFoundError(`Appointment with id ${appointmentId} not found`)
            }
            // 422
            if (existing.status !== 'scheduled') {
                throw new UnprocessableEntityError('Only scheduled appointments can be updated')
            }
            if (toBusinessLocal(existing.starts_at).date < today) {
                throw new UnprocessableEntityError('Appointments dated before today cannot be updated')
            }

            // Compare timestamps as exact points in time instead of strings
            // '10:15+05:00' equals '05:15Z'
            const masterChanged = data.master_id !== existing.master_id
            const clientChanged = data.client_id !== existing.client_id
            const serviceChanged = data.service_id !== existing.service_id
            const startsChanged = new Date(data.starts_at).getTime() !== existing.starts_at.getTime()
            const durationChanged = data.duration !== existing.duration

            const snapshotPatch: appointmentRepository.SnapshotPatch = {}

            // 404 and 422, performs validation lookups only for modified entities
            if (masterChanged) {
                const master = await lockMasterByIdForBooking(client, data.master_id)
                if (!master) {
                    throw new NotFoundError(`Master with id ${data.master_id} not found`)
                }
                if (!master.active) {
                    throw new UnprocessableEntityError('Master is inactive')
                }
                snapshotPatch.master = {
                    name: master.name,
                    phone: master.phone,
                    active_at_booking: master.active
                }
            }
            if (clientChanged) {
                const clientData = await findClientByIdForBooking(client, data.client_id)
                if (!clientData) {
                    throw new NotFoundError(`Client with id ${data.client_id} not found`)
                }
                snapshotPatch.client = {
                    name: clientData.name,
                    phone: clientData.phone
                }
            }
            if (serviceChanged) {
                const service = await findServiceByIdForBooking(client, data.service_id)
                if (!service) {
                    throw new NotFoundError(`Service with id ${data.service_id} not found`)
                }
                snapshotPatch.service = {
                    name: service.name,
                    default_price: service.price,
                    default_duration: service.duration
                }
            }

            // 422
            if (start.date < today) {
                throw new UnprocessableEntityError('Target date must not be earlier than today')
            }

            // Skip schedule validation if only price, client, or service changed
            // a newer schedule version should not block such updates
            if (masterChanged || startsChanged || durationChanged) {
                await assertFitsWorkingInterval(client, data.master_id, start, end)
            }

            // 409 and FK-404
            await appointmentRepository.updateAppointment(client, appointmentId, data, endsAt)

            if (masterChanged || clientChanged || serviceChanged) {
                await appointmentRepository.updateAppointmentSnapshot(client, appointmentId, snapshotPatch)
            }

            const updated = await appointmentRepository.findAppointmentByIdTx(client, appointmentId)
            if (!updated) {
                throw new Error('Updated appointment was not found')
            }
            return updated
        }
    )

    return toAppointmentResponse(row)
}