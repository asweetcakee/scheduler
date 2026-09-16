import { handleResponse } from './handleResponse'

const baseUrl = '/api/masters'

type Master = {
    id: number,
    name: string,
    phone: string,
    active: boolean
}

export const getMasters = async(): Promise<Master[]> => {
    const response = await fetch(baseUrl)
    return handleResponse<Master[]>(response)
}