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