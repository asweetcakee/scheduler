import { createPortal } from 'react-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { createStaffSchema } from '../../schema/appointmentSchema'

const CreateStaffModal = ({ onClose, onCreated }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(createStaffSchema),
  })

  const onSubmit = async (data) => {
    // TODO: replace with real API call
    // const res = await axios.post('/api/clients', data)
    // onCreated(res.data)

    // Mock — simulate created client returned from server
    const newStaff = {
      id: Date.now(), // temp id, server will assign real one
      name: data.name,
      role: data.role,
      services: [],  // new staff has no services yet
    }
    onCreated(newStaff)
  }
  
  const content = (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-800">
            Новый мастер
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Имя</label>
            <input
              {...register('name')}
              placeholder={'Алия Аскаровна'}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (             
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Роль
            </label>
            <input
              {...register('role')}
              placeholder="парикмахер"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.role && (
              <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-slate-600
                         border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 text-sm font-medium text-white
                         bg-blue-600 rounded-xl hover:bg-blue-700
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

export default CreateStaffModal