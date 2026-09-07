import * as clientRepository from './client.repository.js'

export const createClient = async (
    name: string,
    phone: string,
    note: string | null
) => {
    return clientRepository.create(name, phone, note)
}

export const findClientById = async (id: number) => {
    return clientRepository.findById(id)
}