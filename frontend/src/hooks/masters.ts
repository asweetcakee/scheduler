import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createMaster, removeMaster, getMasters, updateMaster, getMasterById } from '../api/masters'
import type { UpdateMasterInput } from '../types/master'
import type { ID } from '../schemas/scheduleSchema'

export const useMasters = () => {
    return useQuery({
        queryKey: ['masters'],
        queryFn: getMasters
    })
}

export const useMasterById = (id: ID, enabled = true) => {
    return useQuery({
        queryKey: ['masters', id],
        queryFn: () => getMasterById(id),
        enabled
    })
}

export const useCreateMaster = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createMaster,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['masters'] })
        }
    })
}

export const useUpdateMaster = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateMasterInput }) => updateMaster(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['masters'] })
        }
    })
}

export const useRemoveMaster = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: removeMaster,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['masters'] })
        }
    })
}