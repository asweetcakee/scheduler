import { ChevronDown, X } from "lucide-react"
import { useContext } from "react"
import { useClientContext } from './ClientContext'

const ComboboxControl = () => {
  const { open, setOpen, selectedClient, handleClear, query, setQuery } = useClientContext()
  
  return (
    <div
      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg
                  flex items-center justify-between cursor-pointer
                  focus-within:ring-2 focus-within:ring-blue-500"
      onClick={() => setOpen(v => !v)}
    >
      {!open && selectedClient ? (
        <div className="flex items-center justify-between flex-1">
          <div>
            <span className="text-slate-800 font-medium">{selectedClient.name}</span>
            <span className="text-slate-400 text-xs ml-2">{selectedClient.phone}</span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-0.5 hover:bg-slate-100 rounded text-slate-400"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <input 
          autoFocus={open}
          value={query}
          placeholder='Поиск по имени или телефону'
          className="flex-1 outline-none bg-transparent text-sm"
          onChange={e => setQuery(e.target.value)}
          onClick={e => {
            e.stopPropagation()
            setOpen(true)
          }}
        />
      )}
      {!selectedClient && (
        <ChevronDown size={16} className="text-slate-400 shrink-0 ml-2" />
      )}
    </div>
  )
}

export default ComboboxControl