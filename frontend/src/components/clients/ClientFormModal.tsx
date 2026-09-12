import { Controller, useForm } from 'react-hook-form'
import type { ClientFormModalProps } from '../../types/client'
import { clientSchema, type ClientForm } from '../../schemas/clientSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateClient, useUpdateClient } from '../../hooks/clients'
import { formatPhoneDisplay } from './phone'
import { Modal } from '../shared/Modal'

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
        <Modal onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-2'>
                <label htmlFor='name'>Имя:</label>
                <input
                    {...register('name')}
                    type='text' 
                    placeholder='Имя'
                    className='border border-primary focus:border-accent-purple outline-none rounded px-3 py-2'
                />
                {errors.name && (
                    <span className='text-danger text-sm'>{errors.name.message}</span>
                )}

                <label htmlFor='phone'>Номер телефона:</label>
                <Controller
                    name='phone'
                    control={control}
                    render={({ field }) => (
                        <div className='flex items-center border border-primary focus-within:border-accent-purple rounded px-3 py-2'>
                            <span className='text-text-secondary mr-1'>+7</span>
                            <input
                                type='tel'
                                value={formatPhoneDisplay(field.value ?? '')}
                                onChange={(e) => {
                                    const raw = e.target.value
                                    const newDigits =  raw.replace(/\D/g, '').slice(0, 10)
                                    const oldDigits = field.value ?? ''
                                    const isMaskCharDeleted = 
                                        newDigits.length === oldDigits.length
                                        && raw.length < formatPhoneDisplay(oldDigits).length
                                    field.onChange(isMaskCharDeleted ? newDigits.slice(0, -1) : newDigits)
                                }}
                                placeholder='(707) 123-45-67'
                                className='outline-none flex-1'
                            />
                        </div>
                    )}
                />
                {errors.phone && (
                    <span className='text-danger text-sm'>{errors.phone.message}</span>
                )}

                <label htmlFor='note'>Заметка:</label>
                <textarea 
                    {...register('note')}
                    placeholder='Постоянный клиент'
                    rows={4}
                    maxLength={2000}
                    className='border border-primary focus:border-accent-purple outline-none rounded px-3 py-2 resize-y min-h-[80px] max-h-[300px]'
                />
                {errors.note && (
                    <span className='text-danger text-sm'>{errors.note.message}</span>
                )}
                
                <button type='submit' className='bg-accent-purple hover:bg-accent-purple-hover text-text-alt font-medium px-4 py-2 rounded-lg transition-colors'>
                    {isEditing ? 'Обновить' : 'Добавить'}
                </button>
            </form>
        </Modal>
    )
}