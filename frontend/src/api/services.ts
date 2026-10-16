import type { CreateServiceInput, Service, UpdateServiceInput } from '../types/service'
import { ApiError } from './apiError'
import { handleResponse } from './handleResponse'

const baseUrl = '/api/services'

export const getServices = async(): Promise<Service[]> => {
    const response = await fetch(baseUrl)
    return handleResponse<Service[]>(response)
}

export const getServiceById = async(id: number): Promise<Service> => {
    const response = await fetch(`${baseUrl}/${id}`)
    return handleResponse<Service>(response)
}

export const createService = async(data: CreateServiceInput): Promise<Service> => {
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return handleResponse<Service>(response)
}

export const updateService = async(id: number, data: UpdateServiceInput): Promise<Service> => {
    const response = await fetch(`${baseUrl}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return handleResponse<Service>(response)
}

export const removeService = async(id: number): Promise<void> => {
    const response = await fetch(`${baseUrl}/${id}`, {
        method: 'DELETE'
    })

    if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new ApiError(response.status, body, 'Failed to delete service')
    }
}