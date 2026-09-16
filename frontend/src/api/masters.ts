import { handleResponse } from './handleResponse'

const baseUrl = '/api/masters'

type Master = {
    id: number,
    name: string,
    phone: string,
    active: boolean
}

type CreateMasterInput = {
    name: string,
    phone: string,
    active?: boolean
}

type UpdateMasterInput = {
    name?: string,
    phone?: string,
    active?: boolean
}

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