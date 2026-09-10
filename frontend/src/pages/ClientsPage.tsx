import { useMemo, useState } from 'react'
import { useClients, useRemoveClient } from '../hooks/clients'
import type { Client, ModalState } from '../types/client'
import { ClientFormModal } from '../components/clients/ClientFormModal'
import { formatPhoneDisplay } from '../components/clients/phone'

export const ClientPage = () => {
    const { data: clients, isLoading, error } = useClients()
    const [modalState, setModalState] = useState<ModalState>(null)
    const [phoneSearch, setPhoneSearch] = useState<string>('')
    const deleteMutation = useRemoveClient()
    
    const filteredClients = useMemo(() => {
        if (!clients) return []
        if (phoneSearch === '') return clients
        return clients.filter(client => client.phone.includes(phoneSearch))
    }, [clients, phoneSearch])

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

    const handleDelete = (client: Client) => {
        const isConfirmed: boolean = window.confirm(`Вы действительно хотите удалить ${client.name}`)
        if (isConfirmed) {
            deleteMutation.mutate(client.id)
        }
    }

    return (
        <div className='p-6'>
            <div className='flex justify-between items-center mb-4'>
                <div className='flex items-center border border-slate-300 rounded-lg px-3 py-2 bg-white max-w-xs'>
                    <span className='text-slate-400 font-medium select-none mr-1.5'>+7</span>
                    <input 
                        type='tel'
                        placeholder='707 123 4567'
                        className='w-full p-0 outline-none text-slate-800 placeholder-slate-400'
                        value={formatPhoneDisplay(phoneSearch ?? '')}
                        onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                            setPhoneSearch(digits)
                        }}
                    />
                </div>
                <button 
                    onClick={handleOpenCreate}
                    className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors'
                >
                    + Добавить клиента
                </button>
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
                        filteredClients?.map((client: Client) => (
                            <tr key={client.id}>
                                <td>{client.name}</td>
                                <td>{client.phone}</td>
                                <td>{client.note}</td>
                                <td>
                                    <button onClick={() => handleEdit(client)}>Edit</button>
                                    <button onClick={() => handleDelete(client)}>Delete</button>
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