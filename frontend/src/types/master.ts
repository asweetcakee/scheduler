export type Master = {
    id: number,
    name: string,
    phone: string,
    active: boolean
}

export type CreateMasterInput = {
    name: string,
    phone: string,
    active?: boolean
}

export type UpdateMasterInput = {
    name?: string,
    phone?: string,
    active?: boolean
}