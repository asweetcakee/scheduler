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