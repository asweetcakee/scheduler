import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createService, getServices, removeService, updateService } from '../api/services'
import type { UpdateServiceInput } from '../types/service'

export const useServices = () => {
    return useQuery({
        queryKey: ['services'],
        queryFn: getServices
    })
}

export const useCreateService = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] })
        }
    })
}

export const useUpdateService = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, data}: {id: number, data: UpdateServiceInput}) => updateService(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] })
        }
    })
}

export const useRemoveService = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: removeService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] })
        }
    })
}