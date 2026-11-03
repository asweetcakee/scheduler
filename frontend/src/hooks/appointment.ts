import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Duration, ID, TimeStampTZ } from '../schemas/appointmentSchema'
import { changeAppointmentStatus, createAppointment, getAppointmentById, getAvailableMasters, removeAppointment, updateAppointment } from '../api/appointments'
import type { AppointmentBody, ChangeableStatus } from '../types/appointment'

export const useAppointment = (id: ID) => {
    return useQuery({
        queryKey: ['appointments', 'detail', id],
        queryFn: () => getAppointmentById(id),
        enabled: Boolean(id)
    })
}

export const useAvailableMasters = (
    starts_at: TimeStampTZ | undefined,
    duration: Duration | undefined,
    client_id: ID | undefined,
    exclude_appointment_id?: ID
) => {
    return useQuery({
        queryKey: ['appointments', 'available-masters', starts_at, duration, client_id, exclude_appointment_id],
        queryFn: () => {
            if (!starts_at || duration === undefined || client_id === undefined) {
                throw new Error('Missing availability parameters')
            }

            return getAvailableMasters(starts_at, duration, client_id, exclude_appointment_id)
        },
        enabled: Boolean(starts_at) &&
            duration !== undefined &&
            client_id !== undefined
    })
}

export const useCreateAppointment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar'] })
            queryClient.invalidateQueries({ queryKey: ['appointments'] })
        }
    })
}

export const useUpdateAppointment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: ID, data: AppointmentBody }) => updateAppointment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar'] })
            queryClient.invalidateQueries({ queryKey: ['appointments'] })
        }
    })
}

export const useChangeAppointmentStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, status }: { id: ID, status: ChangeableStatus }) => changeAppointmentStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar'] })
            queryClient.invalidateQueries({ queryKey: ['appointments'] })
        }
    })
}

export const useRemoveAppointment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: removeAppointment,
        onSuccess: (id) => {
            queryClient.removeQueries({
                queryKey: ['appointments', 'detail', id]
            })

            queryClient.invalidateQueries({ queryKey: ['calendar'] })
            queryClient.invalidateQueries({ queryKey: ['appointments'] })
        }
    })
}