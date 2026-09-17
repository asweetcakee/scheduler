import { useMemo, useState } from 'react'
import { formatPhoneDisplay, getUpdatedDigits } from '../components/shared/phone'
import { Badge } from '../components/shared/Badge'
import { useMasters } from '../hooks/masters'
import type { Master } from '../types/master'

export const MastersPage = () => {
    const { data: masters, isLoading, error } = useMasters()
    const [nameSearch, setNameSearch] = useState<string>('')
    const [phoneSearch, setPhoneSearch] = useState<string>('')
    const [isFocused, setIsFocused] = useState<boolean>(false)
    const showPrefix = isFocused || (phoneSearch ?? '').length > 0

    const filteredMasters = useMemo(() => {
        if (!masters) return []
        return masters.filter(master => 
            (nameSearch === '' || master.name.toLowerCase().includes(nameSearch.toLowerCase()))
            && (phoneSearch === '' || master.phone.includes(phoneSearch))
        )
        
    }, [masters, nameSearch, phoneSearch])
    
    if (isLoading) return <p>Loading clients...</p>
    if (error) return <p>Error: {error.message}</p>

    const handleEdit = (master: Master) => {
        return
    }

    const handleDelete = (master: Master) => {
        return
    }

    const masterStatusMap = {
        active: { variant: 'success', text: 'Работает' },
        inactive: { variant: 'danger', text: 'Не работает' }
    } as const

    return(
        <div className='flex flex-col'>
            <div className='flex justify-start items-center mx-6 mt-6 gap-2'>
                <div className='flex justify-center items-center px-3 py-2 rounded-lg border border-transparent focus-within:border-accent-purple bg-surface max-w-xs group'>
                    <input 
                        type='text' 
                        placeholder='Поиск по имени...'
                        className='outline-none'
                        value={nameSearch ?? ''}
                        onChange={(e) => {
                            setNameSearch(e.target.value.trim())
                        }}
                    />
                </div>
                <div className='flex justify-center items-center px-3 py-2 rounded-lg border border-transparent focus-within:border-accent-purple bg-surface max-w-xs group'>
                    {showPrefix && (
                        <span className='text-primary font-medium select-none mr-1.5'>+7</span>
                    )}
                    <input 
                        type='tel' 
                        placeholder='Поиск по телефону...'
                        className='outline-none'
                        value={formatPhoneDisplay(phoneSearch ?? '')}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onChange={(e) => {
                            setPhoneSearch(getUpdatedDigits(e.target.value.trim(), phoneSearch ?? ''))
                        }}
                    />
                </div>
                <button className='bg-accent-purple hover:bg-accent-purple-hover text-text-alt font-medium px-4 py-2 rounded-lg transition-colors'>
                    Добавить
                </button>
            </div>
            <div className='m-6 px-6 pb-6 overflow-x-auto bg-surface rounded-lg'>
                <table className='w-full text-left border-collapse'>
                    <colgroup>
                        <col className='w-[10%]' />
                        <col className='w-[20%]' />
                        <col className='w-[10%]' />
                        <col className='w-[60%]' />
                    </colgroup>
                    <thead>
                        <tr>
                            <th className='px-4 py-3 font-bold uppercase tracking-wide text-text'>Имя</th>
                            <th className='px-4 py-3 font-bold uppercase tracking-wide text-text'>Телефон</th>
                            <th className='px-4 py-3 font-bold uppercase tracking-wide text-text'>Статус</th>
                            <th className='px-4 py-3 font-bold uppercase tracking-wide text-text text-right'>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            filteredMasters?.map((master: Master) => {
                                const status = masterStatusMap[master.active ? 'active' : 'inactive']
                                return (
                                    <tr key={master.id} className='bg-row-alt even:bg-surface'>
                                        <td className='px-4 py-3 text-text truncate'>{master.name}</td>
                                        <td className='px-4 py-3 text-text-secondary truncate'>+7 {formatPhoneDisplay(master.phone)}</td>
                                        <td>
                                            <Badge variant = {status.variant} text = {status.text}/>
                                        </td>
                                        <td className='px-4 py-3 text-right space-x-3 whitespace-nowrap'>
                                            <button 
                                                onClick={() => handleEdit(master)}
                                                className='px-3 py-2 bg-accent-purple hover:bg-accent-purple-hover text-text-alt font-medium text-sm rounded-lg transition-colors'
                                            >
                                                    Изменить
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(master)}
                                                className='px-3 py-2 bg-danger hover:bg-danger-hover  text-text-alt font-medium text-sm rounded-lg transition-colors'
                                            >
                                                Удалить
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}