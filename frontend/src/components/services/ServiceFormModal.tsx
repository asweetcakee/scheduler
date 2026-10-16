import { useForm } from 'react-hook-form'
import { useCreateService, useUpdateService } from '../../hooks/services'
import type { ServiceFormModalProps } from '../../types/service'
import { Modal } from '../shared/Modal'
import { serviceSchema, type ServiceForm, type ServiceFormInput } from '../../schemas/serviceSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { secondsToMinutes } from './duration'

export const ServiceFormModal = ({ service, onClose }: ServiceFormModalProps) => {
    const createMutation = useCreateService()
    const updateMutation = useUpdateService()
    const isEditing = service !== null

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ServiceFormInput, unknown, ServiceForm>({
        resolver: zodResolver(serviceSchema),
        mode: 'onBlur',
        defaultValues: service 
            ? { name: service.name, price: service.price, duration: secondsToMinutes(service.duration) }
            : { name: '', price: '', duration: 0 }
    })
    
    const onSubmit = (data: ServiceForm) => {
        if (isEditing) {
            updateMutation.mutate(
                { id: service.id, data },
                { onSuccess: onClose }
            )
            return
        }
        createMutation.mutate(data, { onSuccess: onClose })
    }

    const activeMutation = isEditing ? updateMutation : createMutation
    return (
        <Modal onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-2'>
                <label htmlFor='name'>Название:</label>
                <input 
                    {...register('name')}
                    type='text'
                    placeholder='Название'
                    className='border border-primary focus:border-accent-purple outline-none rounded px-3 py-2'
                />
                {errors.name && (
                    <span className='text-danger text-sm'>{errors.name.message}</span>
                )}

                <label htmlFor='price'>Стоимость:</label>
                <input 
                    {...register('price')}
                    type='text'
                    placeholder='0.00'
                    className='border border-primary focus:border-accent-purple outline-none rounded px-3 py-2'
                />
                {errors.price && (
                    <span className='text-danger text-sm'>{errors.price.message}</span>
                )}

                <label htmlFor='duration'>Длительность:</label>
                <input 
                    {...register('duration')}
                    type='number'
                    placeholder='0'
                    className='border border-primary focus:border-accent-purple outline-none rounded px-3 py-2'
                />
                {errors.duration && (
                    <span className='text-danger text-sm'>{errors.duration.message}</span>
                )}
                {activeMutation.error && (
                    <span className='text-danger text-sm'>
                        {activeMutation.error.message}
                    </span>
                )}
                <button type='submit' className='bg-accent-purple hover:bg-accent-purple-hover text-text-alt font-medium px-4 py-2 rounded-lg transition-colors'>
                    {activeMutation.isPending ? 'Сохранение...' : isEditing ? 'Обновить' : 'Добавить'}
                </button>
            </form>
        </Modal>
    )
}