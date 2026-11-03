import { Modal } from '../shared/Modal'

type AppointmentFormModalProps = {
    handleClose: () => void
}

export const AppointmentFormModal = ({ handleClose }: AppointmentFormModalProps) => {
    return (
        <Modal onClose={handleClose}>
            <div>Hello</div>
        </Modal>
    )
}