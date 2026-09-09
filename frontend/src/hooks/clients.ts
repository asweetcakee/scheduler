import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient, getClients, removeClient, updateClient } from '../api/clients'
import type { UpdateClientInput } from '../types/client'

export const useClients = (phone?: string) => {
    return useQuery({
        queryKey: ['clients', phone],
        queryFn: () => getClients(phone)
    })
}

export const useCreateClient = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
        }
    })
}

export const useUpdateClient = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateClientInput }) => updateClient(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
        }
    })
}

export const useRemoveClient = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: removeClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
        }
    })
}