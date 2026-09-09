import { useClients } from './hooks/clients'

const App = () => {
  const { data: clients, isLoading, error } = useClients()
  
  if (isLoading) return <p>Loading clients...</p>
  if (error) return <p>Error: {error.message}</p>
  
  return (
    <ul>
      {
        clients?.map((client) => (
          <li key={client.id}>{client.name}</li>
        ))
      }
    </ul>
  )
}

export default App