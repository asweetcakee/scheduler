import { Controller, useForm } from 'react-hook-form'
import { masterSchema, type MasterForm, type MasterFormInput } from '../../schemas/masterSchema'
import { Modal } from '../shared/Modal'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateMaster, useUpdateMaster } from '../../hooks/masters'
import type { MasterFormModalProps } from '../../types/master'
import { formatPhoneDisplay, getUpdatedDigits } from '../shared/phone'

export const MasterFormModal = ({ master, onClose }: MasterFormModalProps) => {
    const isEditing = master !== null
    const createMutation = useCreateMaster()
    const updateMutation = useUpdateMaster()

    const { 
        register,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<MasterFormInput, unknown, MasterForm>({
        resolver: zodResolver(masterSchema),
        mode: 'onBlur',
        defaultValues: master 
            ? { name: master.name, phone: master.phone, active: master.active }
            : { name: '', phone: '' }
    })

    const onSubmit = (data: MasterForm) => {
        if (isEditing) {
            updateMutation.mutate(
                { id: master.id, data },
                { onSuccess: onClose }
            )
            return
        }
        createMutation.mutate(data, { onSuccess: onClose })
    }

    const baseToggleStyle = 'px-3 py-2 font-medium text-sm rounded-lg transition-colors'
    const activeMutation = isEditing ? updateMutation : createMutation
    return (
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
                    control={ control }
                    render={({ field }) => (
                        <div className='flex items-center border border-primary focus-within:border-accent-purple rounded px-3 py-2'>
                            <span className='text-text-secondary mr-1'>+7</span>
                            <input 
                                type='tel'
                                placeholder='(707) 123-45-67'
                                className='outline-none w-full'
                                value={formatPhoneDisplay(field.value ?? '')}
                                onChange={(e) => {
                                    field.onChange(getUpdatedDigits(e.target.value, field.value ?? ''))
                                }}
                            />
                        </div>
                    )}
                />
                {errors.phone && (
                    <span className='text-danger text-sm'>{errors.phone.message}</span>
                )}

                {master && (
                    <div className='flex flex-col gap-2'>
                        <label htmlFor='active'>Статус сотрудника:</label>
                        <Controller
                            name='active'
                            control={control}
                            render={({ field }) => (
                                <button
                                    type='button'
                                    role='switch'
                                    aria-checked={ field.value }
                                    onClick={() => field.onChange(!field.value)}
                                    className={`${baseToggleStyle} 
                                        ${field.value
                                            ? 'bg-status-active-bg text-status-active'
                                            : 'bg-status-inactive-bg text-status-inactive' 
                                        }`
                                    }
                                >
                                    {field.value ? 'Работает' : 'Не работает'}
                                </button>
                            )}
                        />
                    </div>
                )}

                <button type='submit' className='bg-accent-purple hover:bg-accent-purple-hover text-text-alt font-medium px-4 py-2 rounded-lg transition-colors'>
                    {activeMutation.isPending ? 'Сохранение...' : isEditing ? 'Обновить' : 'Добавить'}
                </button>
            </form>
        </Modal>
    )
}