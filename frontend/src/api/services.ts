import type { Service } from '../types/services'
import { handleResponse } from './handleResponse'

const baseUrl = '/api/services'

export const getServices = async(): Promise<Service[]> => {
    const response = await fetch(baseUrl)
    return handleResponse<Service[]>(response)
}