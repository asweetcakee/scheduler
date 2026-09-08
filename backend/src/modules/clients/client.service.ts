import type { UpdateClientInput } from '../../schemas/clientSchema.js'
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

export const findClientByPhone = async (phone: string) => {
    return clientRepository.findByPhone(phone)
}

export const findAllClients = async () => {
    return clientRepository.findClients()
}

export const updateClient = async ( id: number, data: UpdateClientInput) => {
    return clientRepository.update(id, data)
}