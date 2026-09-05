import * as clientRepository from './client.repository.js'

export const findClientById = async (id: number) => {
    return clientRepository.findById(id)
}