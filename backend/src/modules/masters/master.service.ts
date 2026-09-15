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
    return masterRepository.findMasters()
}

export const findMasterById = async (id: number) => {
    return masterRepository.findMasterById(id)
}

export const updateMaster = async (id: number, data: UpdateMasterInput) => {
    return masterRepository.update(id, data)
}

export const removeMaster = async (id: number) => {
    return masterRepository.remove(id)
}