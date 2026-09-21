import * as repository from './service.repository.js'

export const createService = async (
    name: string,
    price: string,
    duration: number
) => {
    return repository.create(name, price, duration)
}