import type { CreateMasterInput, Master, UpdateMasterInput } from '../types/master'
import { ApiError } from './apiError'
import { handleResponse } from './handleResponse'

const baseUrl = '/api/masters'

export const getMasters = async(): Promise<Master[]> => {
    const response = await fetch(baseUrl)
    return handleResponse<Master[]>(response)
}

export const getMasterById = async(id: number): Promise<Master> => {
    const response = await fetch(`${baseUrl}/${id}`)
    return handleResponse<Master>(response)
}

export const createMaster = async(data: CreateMasterInput): Promise<Master> => {
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return handleResponse<Master>(response)
}

export const updateMaster = async(id: number, data: UpdateMasterInput): Promise<Master> => {
    const response = await fetch(`${baseUrl}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return handleResponse<Master>(response)
}

export const deleteMaster = async(id: number): Promise<void> => {
    const response = await fetch(`${baseUrl}/${id}`, {
        method: 'DELETE'
    })

    if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new ApiError(response.status, body, 'Failed to delete master')
    }
}