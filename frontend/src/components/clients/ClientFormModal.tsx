import type { Client } from '../../types/client'

type ClientFormModalProps = {
    client: Client | null,
    onClose: () => void
}

export const ClientFormModal = ({ client, onClose }: ClientFormModalProps) => {
    console.log('Modal client: ', client)
    return <div className='w-[300px] h-[600px] bg-[#E3E3E3]'>MODAL</div>
}