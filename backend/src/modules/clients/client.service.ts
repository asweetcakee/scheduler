import { NotFoundError } from '../../errors/NotFoundError.js'
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
    const client = await clientRepository.findById(id)
    if (!client) {
        throw new NotFoundError(`Client with id ${id} not found`)
    }
    return client
}

export const findClientByPhone = async (phone: string) => {
    return clientRepository.findByPhone(phone)
}

export const findAllClients = async () => {
    return clientRepository.findAll()
}

export const updateClient = async ( id: number, data: UpdateClientInput) => {
    const client = await clientRepository.update(id, data)
    if (!client) {
        throw new NotFoundError(`Client with id ${id} not found`)
    }
    return clientRepository.update(id, data)
}

export const removeClient = async ( id: number ): Promise<void> => {
    const removed = await clientRepository.remove(id)
    if (!removed) {
        throw new NotFoundError(`Client with id ${id} not found`)
    }
}