import { useMemo, useState } from 'react'
import { useClients, useRemoveClient } from '../hooks/clients'
import type { Client, ModalState } from '../types/client'
import { ClientFormModal } from '../components/clients/ClientFormModal'
import { formatPhoneDisplay, getUpdatedDigits, normalizePastedPhone } from '../components/shared/phone'

export const ClientPage = () => {
    const { data: clients, isLoading, error } = useClients()
    const [modalState, setModalState] = useState<ModalState>(null)
    const [phoneSearch, setPhoneSearch] = useState<string>('')
    const [isFocused, setIsFocused] = useState<boolean>(false)
    const deleteMutation = useRemoveClient()
    const showPrefix = isFocused || (phoneSearch ?? '').length > 0

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
        <div className='flex flex-col'>
            <div className='flex justify-start items-center mx-6 mt-6 gap-2'>
                <div className='flex items-center border border-transparent focus-within:border-accent-purple rounded-lg px-3 py-2 bg-surface max-w-xs group'>
                    {showPrefix && (
                        <span className='text-primary font-medium select-none mr-1.5'>+7</span>
                    )}
                    <input 
                        type='tel'
                        placeholder='Поиск по номеру...'
                        className='w-full p-0 outline-none text-primary placeholder-text-muted'
                        value={formatPhoneDisplay(phoneSearch ?? '')}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onChange={(e) => {
                            setPhoneSearch(getUpdatedDigits(e.target.value, phoneSearch ?? ''))
                        }}
                        onPaste={(e) => {
                            e.preventDefault()
                            const raw = e.clipboardData.getData('text/plain')
                            setPhoneSearch(normalizePastedPhone(raw))
                        }}
                    />
                </div>
                <button 
                    onClick={handleOpenCreate}
                    className='bg-accent-purple hover:bg-accent-purple-hover text-text-alt font-medium px-4 py-2 rounded-lg transition-colors'
                >
                    Добавить
                </button>
            </div>
            <div className='m-6 px-6 pb-6 overflow-x-auto bg-surface rounded-lg'>
                <table className='w-full text-left border-collapse'>
                    <colgroup>
                        <col className='w-[10%]' />
                        <col className='w-[20%]' />
                        <col className='w-[50%]' />
                        <col className='w-[20%]' />
                    </colgroup>
                    <thead>
                        <tr>
                            <th className='px-4 py-3 font-bold uppercase tracking-wide text-text'>Имя</th>
                            <th className='px-4 py-3 font-bold uppercase tracking-wide text-text'>Телефон</th>
                            <th className='px-4 py-3 font-bold uppercase tracking-wide text-text'>Заметка</th>
                            <th className='px-4 py-3 font-bold uppercase tracking-wide text-text text-right'>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            filteredClients?.map((client: Client) => (
                                <tr key={client.id} className='bg-row-alt even:bg-surface'>
                                    <td className='px-4 py-3 text-text truncate'>{client.name}</td>
                                    <td className='px-4 py-3 text-text-secondary truncate'>+7 {formatPhoneDisplay(client.phone)}</td>
                                    <td className='px-4 py-3 text-text-muted truncate'>{client.note}</td>
                                    <td className='px-4 py-3 text-right space-x-3 whitespace-nowrap'>
                                        <button 
                                            onClick={() => handleEdit(client)}
                                            className='px-3 py-2 bg-accent-purple hover:bg-accent-purple-hover text-text-alt font-medium text-sm rounded-lg transition-colors'
                                        >
                                                Изменить
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(client)}
                                            className='px-3 py-2 bg-danger hover:bg-danger-hover  text-text-alt font-medium text-sm rounded-lg transition-colors'
                                        >
                                            Удалить
                                        </button>
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
        </div>        
    )
}