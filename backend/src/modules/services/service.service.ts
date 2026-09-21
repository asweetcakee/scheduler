import type { UpdateServiceInput } from '../../schemas/serviceSchema.js'
import * as serviceRepository from './service.repository.js'

export const createService = async (
    name: string,
    price: string,
    duration: number
) => {
    return serviceRepository.create(name, price, duration)
}

export const findAllServices = async () => {
    return serviceRepository.findServices()
}

export const findServiceById = async (id: number) => {
    return serviceRepository.findServiceById(id)
}

export const updateService = async (id: number, data: UpdateServiceInput) => {
    return serviceRepository.update(id, data)
}

export const removeService = async (id: number) => {
    return serviceRepository.remove(id)
}