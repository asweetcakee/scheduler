import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ID, ISODate } from '../schemas/scheduleSchema'
import { createVersion, getVersionById, getVersionForDate, getVersions, removeVersion, updateVersion } from '../api/schedule'
import { getToday } from './helper'
import type { CreateVersionBody, UpdateVersionBody } from '../types/schedule'

export const useVersionForDate = (masterId: ID, date: ISODate = getToday()) => {
    return useQuery({
        queryKey: ['schedule', masterId, 'date', date],
        queryFn: () => getVersionForDate(masterId, date),
        enabled: Boolean(masterId)
    })
}

export const useVersions = (masterId: ID) => {
    return useQuery({
        queryKey: ['schedule', masterId, 'versions'],
        queryFn: () => getVersions(masterId),
        enabled: Boolean(masterId)
    })
}

export const useVersionById = (masterId: ID, versionId: ID, enabled = true) => {
    return useQuery({
        queryKey: ['schedule', masterId, 'version', versionId],
        queryFn: () => getVersionById(masterId, versionId),
        enabled: enabled && Boolean(masterId) && Boolean(versionId)
    })
}

export const useCreateVersion = (masterId: ID) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateVersionBody) => createVersion(masterId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['schedule', masterId]
            })
        }
    })
}

export const useUpdateVersion = (masterId: ID, versionId: ID) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: UpdateVersionBody) => updateVersion(masterId, versionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['schedule', masterId]
            })
        }
    })
}

export const useRemoveVersion = (masterId: ID) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (versionId: ID) => removeVersion(masterId, versionId),
        onSuccess: (_data, versionId) => {
            queryClient.removeQueries({ 
                queryKey: ['schedule', masterId, 'version', versionId]
            })
            return queryClient.invalidateQueries({
                queryKey: ['schedule', masterId]
            })
        }
    })
}