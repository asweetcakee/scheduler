import { NotFoundError } from '../../errors/NotFoundError.js'
import type { UpdateMasterInput } from '../../schemas/masterSchema.js'
import * as masterRepository from './master.repository.js'

export const createMaster = async (
    name: string,
    phone: string,
    active?: boolean
) => {
    return masterRepository.create(name, phone, active)
}

export const findAllMasters = async () => {
    return masterRepository.findAll()
}

export const findMasterById = async (id: number) => {
    const master = await masterRepository.findById(id)
    if (!master) {
        throw new NotFoundError(`Master with id ${id} not found`)
    }
    return master
}

export const updateMaster = async (id: number, data: UpdateMasterInput) => {
    const master = await masterRepository.update(id, data)
    if (!master) {
        throw new NotFoundError(`Master with id ${id} not found`)
    }
    return master
}

export const removeMaster = async (id: number): Promise<void> => {
    const removed = await masterRepository.remove(id)
    if (!removed) {
        throw new NotFoundError(`Master with id ${id} not found`)
    }
}