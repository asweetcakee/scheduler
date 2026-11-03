import type { AppointmentModalState } from '../../types/appointment'
import { Modal } from '../shared/Modal'

type AppointmentFormModalProps = {
    modalState: Exclude<AppointmentModalState, null>,
    onClose: () => void
}

export const AppointmentFormModal = ({ modalState, onClose }: AppointmentFormModalProps) => {
    return (
        <Modal onClose={onClose}>
            <div className='flex flex-col gap-3'>
                <h2 className='text-lg font-semibold text-text'>
                    {modalState.type === 'create'
                        ? 'Создание записи'
                        : `Запись #${modalState.appointmentId}`
                    }
                </h2>

                {modalState.type === 'create' ? (
                    <div className='text-sm text-text-secondary space-y-1'>
                        <p>Дата: {modalState.date}</p>
                        <p>Мастер ID: {modalState.masterId}</p>
                        <p>Время: {modalState.startMinutes} минут от начала дня</p>
                    </div>
                ) : (
                    <p className='text-sm text-text-secondary'>
                        ID записи: {modalState.appointmentId}
                    </p>
                )}

                <button
                    type='button'
                    onClick={onClose}
                    className='px-4 py-2 rounded-lg bg-accent-purple hover:bg-accent-purple-hover text-text-alt font-medium transition-colors'
                >
                    Закрыть
                </button>

            </div>
        </Modal>
    )
}