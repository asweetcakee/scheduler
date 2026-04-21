import { useFormContext } from "react-hook-form"
import ClientModalInput from "./ClientModalInput"

const ClientModalForm = ({ onSubmit, onClose }) => {
  const { handleSubmit, formState: { isSubmitting } } = useFormContext()
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 space-y-4">
      <ClientModalInput name='name' label='Имя' placeholder='Иван Иванов' />
      <ClientModalInput name='phone' label='Телефон' placeholder='+7 (777) 000-00-00' />

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
  )
}

export default ClientModalForm