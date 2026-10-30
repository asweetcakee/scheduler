export type AvailableMastersResponse = {
    id: number,
    name: string
}[]

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled'

export type ChangeableStatus = Exclude<AppointmentStatus, 'scheduled'>

export type AppointmentBody = {
    client_id: number,
    master_id: number,
    service_id: number,
    starts_at: string,
    duration: number,
    price: string
}

export type AppointmentSnapshot = {
    client: {
        name: string,
        phone: string
    },
    master: {
        name: string,
        phone: string,
        active_at_booking: boolean
    },
    service: {
        name: string,
        default_price: string,
        default_duration: number
    }
}

export type AppointmentResponse = {
    id: number,
    client_id: number,
    master_id: number,
    service_id: number,
    starts_at: string,
    ends_at: string,
    duration: number,
    price: string,
    status: AppointmentStatus,
    created_at: string,
    snapshot: AppointmentSnapshot,
    start_minutes: number,
    end_minutes: number
}