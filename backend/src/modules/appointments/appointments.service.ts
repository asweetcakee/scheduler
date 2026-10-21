import { withTransaction } from '../../db/withTransaction.js'
import { NotFoundError } from '../../errors/NotFoundError.js'
import { UnprocessableEntityError } from '../../errors/UnprocessableEntityError.js'
import type { CreateAppointmentBody, Duration, ID, TimeStampTZ } from '../../schemas/appointmentSchema.js'
import type { DayOfWeek, ISODate } from '../../schemas/scheduleSchema.js'
import { findClientByIdForBooking } from '../clients/client.repository.js'
import { lockMasterByIdForBooking } from '../masters/master.repository.js'
import { findServiceByIdForBooking } from '../services/service.repository.js'
import { toAppointmentResponse, type AppointmentResponse } from './appointment.mapper.js'
import * as appointmentRepository from './appointments.repository.js'

const BUSINESS_TIME_ZONE = 'Asia/Almaty'

const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    weekday: 'short',
    hour: '2-digit', minute: '2-digit',
    hourCycle: 'h23'
})

const ISO_WEEKDAY: Record<string, DayOfWeek> = {
    Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7
}

type BusinessLocal = {
    date: ISODate,
    dayOfWeek: DayOfWeek,
    minutes: number
}

const toBusinessLocal = (instant: Date): BusinessLocal => {
    const parts = Object.fromEntries(formatter.
        formatToParts(instant)
        .map(part => [part.type, part.value])
    )
    const { year, month, day, weekday, hour, minute } = parts
    const dayOfWeek = weekday ? ISO_WEEKDAY[weekday] : undefined

    if (!year || !month || !day || !hour || !minute || !dayOfWeek) {
        throw new Error('Failed to format date in business time zone')
    }
    return {
        date: `${year.padStart(4, '0')}-${month}-${day}`,
        dayOfWeek,
        minutes: Number(hour) * 60 + Number(minute)
    }
}

const timeToMinutes = (time: string): number => {
    const [h = 0, m = 0] = time.split(':').map(Number)
    return h * 60 + m
}

const calculateEndsAt = ({ starts_at, duration }: { starts_at: TimeStampTZ, duration: Duration }): TimeStampTZ => {
    const startsAt = new Date(starts_at)
    return new Date(startsAt.getTime() + duration * 1000).toISOString()
}

export const createAppointment = async (
    data: CreateAppointmentBody
): Promise<AppointmentResponse> => {
    const endsAt = calculateEndsAt(data)
    const start = toBusinessLocal(new Date(data.starts_at))
    const end = toBusinessLocal(new Date(endsAt))
    const today = toBusinessLocal(new Date()).date

    const { appointment, snapshot } = await withTransaction(
        async client => {
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

            if (!master.active) {
                throw new UnprocessableEntityError('Master is inactive')
            }

            if (start.date < today) {
                throw new UnprocessableEntityError('starts_at must not be in the past')
            }

            if (start.date !== end.date) {
                throw new UnprocessableEntityError('Appointment must start and end on the same day')
            }

            const intervals = await appointmentRepository.findWorkingIntervals(client, data.master_id, start.date, start.dayOfWeek)
            const fits = intervals.some(interval => 
                timeToMinutes(interval.starts_at) <= start.minutes &&
                end.minutes <= timeToMinutes(interval.ends_at)
            )

            if (!fits) {
                throw new UnprocessableEntityError('Appointment does not fit inside a working interval')
            }

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