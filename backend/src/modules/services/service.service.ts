import { NotFoundError } from '../../errors/NotFoundError.js'
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
    return serviceRepository.findAll()
}

export const findServiceById = async (id: number) => {
    const service = await serviceRepository.findById(id)
    if (!service) {
        throw new NotFoundError(`Service with id ${id} not found`)
    }
    return service
}

export const updateService = async (id: number, data: UpdateServiceInput) => {
    const service = await serviceRepository.update(id, data)
    if (!service) {
        throw new NotFoundError(`Service with id ${id} not found`)
    }
    return service
}

export const removeService = async (id: number): Promise<void> => {
    const removed = await serviceRepository.remove(id)
    if (!removed) {
        throw new NotFoundError(`Service with id ${id} not found`)
    }
}