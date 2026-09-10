export type Client = {
    id: number,
    name: string,
    phone: string,
    note: string | null
}

export type CreateClientInput = {
    name: string,
    phone: string,
    note?: string | null
}

export type UpdateClientInput = {
    name?: string,
    phone?: string,
    note?: string | null
}

export type ModalState = 'create' | Client | null