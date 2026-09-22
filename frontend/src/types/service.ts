export type Service = {
    id: number,
    name: string,
    price: string,
    duration: number
}

export type CreateServiceInput = {
    name: string,
    price: string,
    duration: number
}

export type UpdateServiceInput = {
    name?: string,
    price?: string,
    duration?: number
}