import { useQuery } from '@tanstack/react-query'
import { getIntervals } from '../api/schedule'

export const useSchedule = (master_id: number) => {
    return useQuery({
        queryKey: ['schedule', master_id],
        queryFn: () => getIntervals(master_id)
    })
}