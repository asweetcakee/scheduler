import { useState } from 'react'
import { useClients } from '../hooks/clients'
import type { Client, ModalState } from '../types/client'
import { ClientFormModal } from '../components/clients/ClientFormModal'

export const ClientPage = () => {
    const { data: clients, isLoading, error } = useClients()
    const [modalState, setModalState] = useState<ModalState>(null)
    
    if (isLoading) return <p>Loading clients...</p>
    if (error) return <p>Error: {error.message}</p>
    
    const handleOpenCreate = () => {
        setModalState('create')
    }

    const handleEdit = (client: Client) => {
        setModalState(client)
    }

    const handleClose = () => {
        setModalState(null)
    }

    const handleDelete = (id: number) => {
        console.log('Delete id: ', id)
    }

    return (
        <div className='p-6'>
            <div className='flex justify-between items-center mb-4'>
                <input placeholder='Поиск по телефону'/>
                <button onClick={handleOpenCreate}>+ Добавить клиента</button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Note</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        clients?.map((client: Client) => (
                            <tr key={client.id}>
                                <td>{client.name}</td>
                                <td>{client.phone}</td>
                                <td>{client.note}</td>
                                <td>
                                    <button onClick={() => handleEdit(client)}>Edit</button>
                                    <button onClick={() => handleDelete(client.id)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            
            {modalState !== null && (
                <ClientFormModal
                    key={modalState === 'create' ? 'create' : modalState.id} 
                    client = { modalState === 'create' ? null : modalState }
                    onClose = {handleClose}
                />
            )}

        </div>
    )
}