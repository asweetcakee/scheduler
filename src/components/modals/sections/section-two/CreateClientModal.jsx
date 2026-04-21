import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import ClientModalHeader from './client-modal-parts/ClientModalHeader'
import ClientModalForm from './client-modal-parts/ClientModalForm'

const createClientSchema = z.object({
  name: z.string().min(1, 'Введите имя клиента').max(100),
  phone: z.string()
    .min(1, 'Введите номер телефона')
    .regex(/^[\d\s\+\-\(\)]{7,20}$/, 'Введите корректный номер'),
})

const CreateClientModal = ({ onClose, onCreated }) => {
  const methods = useForm({ resolver: zodResolver(createClientSchema) })

  const onSubmit = async (data) => {
    // TODO: replace with real API call
    // const res = await axios.post('/api/clients', data)
    // onCreated(res.data)

    // Mock — simulate created client returned from server
    const newClient = {
      id: Date.now(), // temp id, server will assign real one
      name: data.name,
      phone: data.phone,
      discounts: [],  // new client has no discounts yet
    }
    onCreated(newClient)
  }

  return (
    // Stacked backdrop — sits on top of AppointmentModal
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl mx-4"
        onClick={e => e.stopPropagation()}
      >
        <ClientModalHeader onClose={onClose}/>

        <FormProvider {...methods}>
          <ClientModalForm onSubmit={onSubmit} onClose={onClose} />
        </FormProvider>
        
      </div>
    </div>
  )
}

export default CreateClientModal