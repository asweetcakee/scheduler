import { useMemo, useState } from 'react'
import { useRemoveService, useServices } from '../hooks/services'
import type { Service } from '../types/service'
import type { ModalState } from '../types/service'
import { ServiceFormModal } from '../components/services/ServiceFormModal'
import { secondsToMinutes } from '../components/services/duration'

export const ServicesPage = () => {
    const { data: services, isLoading, error } = useServices()
    const [nameSearch, setNameSearch] = useState<string>('')
    const [modalState, setModalState] = useState<ModalState>(null)
    const deleteMutation = useRemoveService()

    const filteredServices = useMemo(() => {
        if (!services) return []
        const query = nameSearch.trim().toLowerCase()
        return services.filter(service => 
            service.name.toLowerCase().includes(query)
        )
    }, [nameSearch, services])
    
    if (isLoading) return <p>Loading clients...</p>
    if (error) return <p>Error: {error.message}</p>

    const handleOpenCreate = () => {
        setModalState('create')
    }

    const handleEdit = (service: Service) => {
        setModalState(service)
    }

    const handleDelete= (service: Service) => {
        const isConfirmed: boolean = window.confirm(`Вы действительно хотите удалить услугу '${service.name}'`)
        if (isConfirmed) {
            deleteMutation.mutate(service.id)
        }
    }

    const onClose = () => {
        setModalState(null)
    }
    return(
        <div className='flex flex-col'>
            <div className='flex justify-start items-center mx-6 mt-6 gap-2'>
                <div className='flex justify-center items-center px-3 py-2 rounded-lg border border-transparent focus-within:border-accent-purple bg-surface max-w-xs group'>
                    <input 
                        type='text'
                        placeholder='Поиск по названию'
                        className='outline-none'
                        value={nameSearch}
                        onChange={(e) => setNameSearch(e.target.value)}
                    />
                </div>
                <button 
                    onClick={handleOpenCreate}
                    className='bg-accent-purple hover:bg-accent-purple-hover text-text-alt font-medium px-4 py-2 rounded-lg transition-colors'>
                    Добавить
                </button>
            </div>
            <div className='m-6 px-6 pb-6 overflow-x-auto bg-surface rounded-lg'>
                <table>
                    <colgroup>
                        <col className='w-[15%]' />
                        <col className='w-[15%]' />
                        <col className='w-[10%]' />
                        <col className='w-[70%]' />
                    </colgroup>
                    <thead>
                        <tr>
                            <th className='px-4 py-3 font-bold uppercase tracking-wide text-text text-left'>Название</th>
                            <th className='px-4 py-3 font-bold uppercase tracking-wide text-text text-left'>Стоимость</th>
                            <th className='px-4 py-3 font-bold uppercase tracking-wide text-text text-left'>Длительность</th>
                            <th className='px-4 py-3 font-bold uppercase tracking-wide text-text text-right'>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredServices?.map((service) => (
                            <tr key={service.id} className='bg-row-alt even:bg-surface'>
                                <td className='px-4 py-3 text-text truncate'>{service.name}</td>
                                <td className='px-4 py-3 text-text-secondary truncate'>{service.price}</td>
                                <td className='px-4 py-3 text-text-muted truncate'>{secondsToMinutes(service.duration)} минут</td>
                                <td className='px-4 py-3 text-right space-x-3 whitespace-nowrap'>
                                    <button 
                                        onClick={() => handleEdit(service)}
                                        className='px-3 py-2 bg-accent-purple hover:bg-accent-purple-hover text-text-alt font-medium text-sm rounded-lg transition-colors'
                                    >
                                        Изменить
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(service)}
                                        className='px-3 py-2 bg-danger hover:bg-danger-hover text-text-alt font-medium text-sm rounded-lg transition-colors'
                                    >
                                        Удалить
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {modalState !== null && (
                    <ServiceFormModal
                        key={ modalState === 'create' ? 'create' : modalState.id }
                        service={ modalState === 'create' ? null : modalState }
                        onClose={ onClose }
                    />
                )}
            </div>
        </div>
    )
}