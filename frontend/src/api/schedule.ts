import type { CreateIntervalBody, Interval, UpdateIntervalBody } from '../types/schedule'
import { ApiError } from './apiError'
import { handleResponse } from './handleResponse'

const baseUrl = '/api/masters'

export const getIntervals = async(master_id: number): Promise<Interval[]> => {
    const response = await fetch(`${baseUrl}/${master_id}/schedule/intervals`)
    return handleResponse<Interval[]>(response)
}

export const createInterval = async(master_id: number, data: CreateIntervalBody): Promise<Interval> => {
    const response = await fetch(`${baseUrl}/${master_id}/schedule/intervals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return handleResponse<Interval>(response)
}

export const updateInterval = async(master_id: number, interval_id: number, data: UpdateIntervalBody): Promise<Interval> => {
    const response = await fetch(`${baseUrl}/${master_id}/schedule/intervals/${interval_id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return handleResponse<Interval>(response)
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