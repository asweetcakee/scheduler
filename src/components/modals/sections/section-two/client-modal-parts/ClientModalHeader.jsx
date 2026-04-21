import { X } from "lucide-react"

const ClientModalHeader = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
      <h3 className="text-base font-semibold text-slate-800">
        Новый клиент
      </h3>
      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
      >
        <X size={18} />
      </button>
    </div>
  )
}

export default ClientModalHeader