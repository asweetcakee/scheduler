import { Controller, useForm } from 'react-hook-form'
import type { ClientFormModalProps } from '../../types/client'
import { clientSchema, type ClientForm } from '../../schemas/clientSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateClient, useUpdateClient } from '../../hooks/clients'
import { formatPhoneDisplay } from './phone'

export const ClientFormModal = ({ client, onClose }: ClientFormModalProps) => {   
    const isEditing = client !== null
    const createMutation = useCreateClient()
    const updateMutation = useUpdateClient()
    
    const {
        control,
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ClientForm>({
        resolver: zodResolver(clientSchema),
        defaultValues: client
            ? { name: client.name, phone: client.phone, note: client.note }
            : { name: '', phone: '', note: '' }
    })

    const onSubmit = (data: ClientForm) => {
        if (isEditing) {
            updateMutation.mutate(
                { id: client.id, data },
                { onSuccess: onClose }
            )
            return
        }
        createMutation.mutate(data, { onSuccess: onClose })
    }

    return(
        <div className='flex items-center justify-center w-[300px] h-[600px] bg-[#E2E2E2]'>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-2'>
                <label htmlFor='name'>Имя:</label>
                <input
                    {...register('name')}
                    type='text' 
                    placeholder='Имя'
                    className='border border-slate-300 rounded px-3 py-2'
                />
                {errors.name && (
                    <span className='text-red-500 text-sm'>{errors.name.message}</span>
                )}

                <label htmlFor='phone'>Номер телефона:</label>
                <Controller
                    name='phone'
                    control={control}
                    render={({ field }) => (
                        <div className='flex items-center border border-slate-300 rounded px-3 py-2'>
                            <span className='text-slate-500 mr-1'>+7</span>
                            <input
                                type='tel'
                                value={formatPhoneDisplay(field.value ?? '')}
                                onChange={(e) => {
                                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                                    field.onChange(digits)
                                }}
                                placeholder='(707) 123-45-67'
                                className='outline-none flex-1'
                            />
                        </div>
                    )}
                />
                {errors.phone && (
                    <span className='text-red-500 text-sm'>{errors.phone.message}</span>
                )}

                <label htmlFor='note'>Заметка:</label>
                <input 
                    {...register('note')}
                    type='text' 
                    placeholder='Постоянный клиент'
                    className='border border-slate-300 rounded px-3 py-2'
                />
                {errors.note && (
                    <span className='text-red-500 text-sm'>{errors.note.message}</span>
                )}
                
                <button type='submit' className='bg-blue-600 text-white rounded px-3 py-2'>
                    {isEditing ? 'Обновить' : 'Добавить'}
                </button>
            </form>
        </div>
    )
}