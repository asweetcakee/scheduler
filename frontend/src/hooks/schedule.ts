import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createInterval, getIntervals, removeInterval, updateInterval } from '../api/schedule'
import type { CreateIntervalBody, UpdateIntervalBody } from '../types/schedule'

export const useSchedule = (master_id: number) => {
    return useQuery({
        queryKey: ['schedule', master_id],
        queryFn: () => getIntervals(master_id)
    })
}

export const useCreateInterval = (master_id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateIntervalBody) => createInterval(master_id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedule', master_id] })
        }
    })
}

export const useUpdateInterval = (master_id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ interval_id, data }: { interval_id:number; data: UpdateIntervalBody }) => updateInterval(master_id, interval_id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedule', master_id] })
        }
    })
}

export const useRemoveInterval = (master_id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (interval_id: number) => removeInterval(master_id, interval_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedule', master_id] })
        }
    })
}