import { UserPlus } from "lucide-react"
import { useContext } from "react"
import { useClientContext } from './ClientContext'

const ComboboxList = () => {
  const { open, setOpen, filtered, handleSelect, clientId, setShowCreateModal } = useClientContext()
  if (!open) return null
  
  return (
    <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200
                    rounded-lg shadow-lg max-h-52 overflow-y-auto">

      {filtered.length === 0 ? (
        <li className="px-3 py-2 text-sm text-slate-400">Клиент не найден</li>
      ) : (
        filtered.map(client => (
          <li
            key={client.id}
            onClick={() => handleSelect(client)}
            className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-50
              ${client.id === clientId
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-700'
              }`}
          >
            <span className="font-medium">{client.name}</span>
            <span className="text-slate-400 text-xs ml-2">{client.phone}</span>
          </li>
        ))
      )}

      <li
        onClick={() => { setOpen(false); setShowCreateModal(true) }}
        className="px-3 py-2 text-sm cursor-pointer border-t border-slate-100
                    text-blue-600 hover:bg-blue-50 flex items-center gap-2 font-medium"
      >
        <UserPlus size={14} />
        Создать нового клиента
      </li>
    </ul>
  )
}

export default ComboboxList