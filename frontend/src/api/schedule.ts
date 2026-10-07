import type { ID, ISODate } from '../schemas/scheduleSchema'
import type { CreateVersionBody, ScheduleResponse, ScheduleResponseDetails, ScheduleVersionResponse, UpdateVersionBody } from '../types/schedule'
import { ApiError } from './apiError'
import { handleResponse } from './handleResponse'

const baseUrl = '/api/masters'

export const getVersions = async(master_id: ID): Promise<ScheduleVersionResponse[]> => {
    const response = await fetch(`${baseUrl}/${master_id}/schedule/versions`)
    return handleResponse<ScheduleVersionResponse[]>(response)
}

export const getVersionForDate = async(master_id: ID, date: ISODate): Promise<ScheduleResponse> => {
    const response = await fetch(`${baseUrl}/${master_id}/schedule?date=${date}`)
    return handleResponse<ScheduleResponse>(response)
}

export const getVersionById = async(master_id: ID, version_id: ID): Promise<ScheduleResponseDetails> => {
    const response = await fetch(`${baseUrl}/${master_id}/schedule/versions/${version_id}`)
    return handleResponse<ScheduleResponseDetails>(response)
}

export const createVersion = async(master_id: ID, data: CreateVersionBody): Promise<ScheduleResponseDetails> => {
    const response = await fetch(`${baseUrl}/${master_id}/schedule/versions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return handleResponse<ScheduleResponseDetails>(response)
}

export const updateVersion = async(master_id: ID, version_id: ID, data: UpdateVersionBody): Promise<ScheduleResponseDetails> => {
    const response = await fetch(`${baseUrl}/${master_id}/schedule/versions/${version_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return handleResponse<ScheduleResponseDetails>(response)
}

export const removeVersion = async(master_id: ID, version_id: ID): Promise<void> => {
    const response = await fetch(`${baseUrl}/${master_id}/schedule/versions/${version_id}`, {
        method: 'DELETE'
    })
    if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new ApiError(response.status, body, 'Не удалось удалить версию расписания')
    }
}