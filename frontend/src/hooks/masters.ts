import { useQuery } from '@tanstack/react-query'
import { getMasters } from '../api/masters'

export const useMasters = () => {
    return useQuery({
        queryKey: ['masters'],
        queryFn: getMasters
    })
}