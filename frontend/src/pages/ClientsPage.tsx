import { useClients } from '../hooks/clients'
import type { Client } from '../types/client'

export const ClientPage = () => {
    const { data: clients, isLoading, error } = useClients()
    
    if (isLoading) return <p>Loading clients...</p>
    if (error) return <p>Error: {error.message}</p>
    
    return (
        <ul>
            {
                clients?.map((client: Client) => (
                    <li key={client.id}>{client.name}</li>
                ))
            }
        </ul>
    )
}