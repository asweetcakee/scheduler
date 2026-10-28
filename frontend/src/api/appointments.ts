import type { Duration, TimeStampTZ } from '../schemas/appointmentSchema'
import type { ID } from '../schemas/scheduleSchema'
import type { AppointmentBody, AppointmentResponse, AvailableMastersResponse, ChangeableStatus } from '../types/appointment'
import { ApiError } from './apiError'
import { handleResponse } from './handleResponse'

const baseUrl = '/api/appointments'

export const getAvailableMasters = async (
    starts_at: TimeStampTZ,
    duration: Duration,
    client_id: ID,
    exclude_appointment_id?: ID
): Promise<AvailableMastersResponse> => {
    const params = new URLSearchParams({
        starts_at,
        duration: String(duration),
        client_id: String(client_id)
    })
    if (exclude_appointment_id !== undefined) {
        params.set('exclude_appointment_id', String(exclude_appointment_id))
    }
    
    const response = await fetch(`${baseUrl}/available-masters?${params}`)
    return handleResponse<AvailableMastersResponse>(response)
}

export const createAppointment = async(body: AppointmentBody): Promise<AppointmentResponse> => {
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    return handleResponse<AppointmentResponse>(response)
}

export const getAppointmentById = async (id: ID): Promise<AppointmentResponse> => {
    const response = await fetch(`${baseUrl}/${id}`)
    return handleResponse<AppointmentResponse>(response)
}

export const updateAppointment = async (id: ID, body: AppointmentBody): Promise<AppointmentResponse> => {
    const response = await fetch(`${baseUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    return handleResponse<AppointmentResponse>(response)
}

export const changeAppointmentStatus = async (id: ID, status: ChangeableStatus): Promise<AppointmentResponse> => {
    const response = await fetch(`${baseUrl}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    })
    return handleResponse<AppointmentResponse>(response)
}

export const removeAppointment = async (id: ID): Promise<void> => {
    const response = await fetch(`${baseUrl}/${id}`, { 
        method: 'DELETE'
    })
    if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new ApiError(response.status, body, 'Не удалось удалить запись')
    }
}