import type { ID } from '../../schemas/appointmentSchema.js'
import type { ISODate } from '../../schemas/calendarSchema.js'
import { formatMinutes, toCalendarMasterResponse, type CalendarResponse } from './calendar.mapper.js'
import * as calendarRepository from './calendar.repository.js'

const BUSINESS_TIME_ZONE = 'Asia/Almaty'
const SLOT_MINUTES = 30

const groupByMaster = <T extends { master_id: ID }>(rows: T[]): Map<ID, T[]> => {
    const groups = new Map<ID, T[]>()
    for (const row of rows) {
        const group = groups.get(row.master_id)
        if (group) {
            group.push(row)
        } else {
            groups.set(row.master_id, [row])
        }
    }
    return groups
}

export const getCalendar = async (date: ISODate): Promise<CalendarResponse> => {
    // Performs 3 queries total, independent of the number of masters
    const [allMasters, intervals, appointments] = await Promise.all([
        calendarRepository.findMasters(),
        calendarRepository.findWorkingIntervals(date),
        calendarRepository.findAppointments(date, BUSINESS_TIME_ZONE)
    ])

    const intervalsByMaster = groupByMaster(intervals)
    const appointmentsByMaster = groupByMaster(appointments)

    // Active masters scheduled for this day OR any master with an appointment
    const masters = allMasters.filter(master =>
        (master.active && intervalsByMaster.has(master.id)) ||
        appointmentsByMaster.has(master.id)
    )

    if (masters.length === 0) {
        return { date, timezone: BUSINESS_TIME_ZONE, time_range: null, masters: [] }
    }

    // Range includes intervals and appointments only for the included masters
    const includedIds = new Set(masters.map(master => master.id))
    const spans = [
        ...intervals.filter(interval => includedIds.has(interval.master_id)),
        ...appointments
    ]

    const rangeStart = Math.floor(Math.min(...spans.map(s => s.start_minutes)) / SLOT_MINUTES) * SLOT_MINUTES
    const rangeEnd = Math.ceil(Math.max(...spans.map(s => s.end_minutes)) / SLOT_MINUTES) * SLOT_MINUTES

    return {
        date,
        timezone: BUSINESS_TIME_ZONE,
        time_range: {
            starts_at: formatMinutes(rangeStart),
            ends_at: formatMinutes(rangeEnd)
        },
        masters: masters.map(master => toCalendarMasterResponse(
            master,
            intervalsByMaster.get(master.id) ?? [],
            appointmentsByMaster.get(master.id) ?? []
        ))
    }
}