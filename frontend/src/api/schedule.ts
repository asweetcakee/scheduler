import type { Schedule } from '../types/schedule'
import { ApiError } from './apiError'
import { handleResponse } from './handleResponse'

const baseUrl = '/api/masters'

type CreateScheduleBody = {
    day_of_week: number,
    starts_at: string,
    ends_at: string
}

type UpdateScheduleBody = {
    day_of_week?: number,
    starts_at?: string,
    ends_at?: string
}

export const getIntervals = async(master_id: number): Promise<Schedule[]> => {
    const response = await fetch(`${baseUrl}/${master_id}/schedule`)
    return handleResponse<Schedule[]>(response)
}

export const createInterval = async(master_id: number, data: CreateScheduleBody): Promise<Schedule> => {
    const response = await fetch(`${baseUrl}/${master_id}/schedule/intervals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return handleResponse<Schedule>(response)
}

export const updateInterval = async(master_id: number, interval_id: number, data: UpdateScheduleBody): Promise<Schedule> => {
    const response = await fetch(`${baseUrl}/${master_id}/schedule/intervals/${interval_id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return handleResponse<Schedule>(response)
}

export const removeInterval = async(master_id: number, interval_id: number): Promise<void> => {
    const response = await fetch(`${baseUrl}/${master_id}/schedule/intervals/${interval_id}`, {
        method: 'DELETE'
    })
    if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new ApiError(response.status, body, 'Failed to delete interval')
    }
}