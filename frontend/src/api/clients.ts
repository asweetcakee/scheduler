import type { Client, CreateClientInput, UpdateClientInput } from '../types/client'
import { ApiError } from './apiError'
import { handleResponse } from './handleResponse'

const baseUrl = '/api/clients'

export const getClientById = async (id: number): Promise<Client> => {
    const response = await fetch(`${baseUrl}/${id}`)
    return handleResponse<Client>(response)
}

export const getClients = async (phone?: string): Promise<Client[]> => {
    const params = new URLSearchParams()
    if (phone) {
        params.set('phone', phone)
    }

    const query = params.toString()
    const url = query ? `${baseUrl}?${query}` : baseUrl
    const response = await fetch(url)
    return handleResponse<Client[]>(response)
}

export const createClient = async (data: CreateClientInput): Promise<Client> => {
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return handleResponse<Client>(response)
}

export const updateClient = async (id: number, data: UpdateClientInput): Promise<Client> => {
    const response = await fetch(`${baseUrl}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return handleResponse<Client>(response)
}

export const removeClient = async (id: number): Promise<void> => {
    const response = await fetch(`${baseUrl}/${id}`, {
        method: 'DELETE'
    })
    
    if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new ApiError(response.status, body, 'Failed to delete client')
    }
}