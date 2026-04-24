import { X } from 'lucide-react'
import { useSchedulerStore } from '../../../store/useSchedulerStore'

const ModalHeader = ({ mode }) => {
  const { closeModal } = useSchedulerStore()
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
      <h2 className="text-base font-semibold text-slate-800">
        { mode === 'create' ? 'Создание новой записи' : 'Изменение записи' }
      </h2>
      <button
        type="button"
        onClick={closeModal}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  )
}

export default ModalHeader