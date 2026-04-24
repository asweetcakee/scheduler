import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'

const SearchCombobox = ({
  // RHF field control
  value,              // current selected id
  onChange,           // (id) => void  — called on select
  onClear,            // () => void    — called on X button

  // Data
  items,              // [{ id, label, sublabel? }]
  
  // Display
  label,
  placeholder,
  notFoundText,

  // 'create new' row at bottom of dropdown
  onCreate,           // () => void — if undefined, no create row shown
  createLabel,        // 'Создать нового клиента'
  CreateIcon,         // lucide icon component
}) => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const selectedStaff = items.find(i => i.id === value)

  // Closes on outside click
  useEffect(() => {
    const handler = (e) => {
      if(!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredStaff = query.trim() === ''
    ? items
    : items.filter(i => 
      i.label.toLowerCase().includes(query.toLowerCase()) ||
      i.sublabel?.includes(query)
    )

  const handleSelect = (item) => {
    onChange(item)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}

      <div
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg
                   flex items-center justify-between cursor-pointer
                   focus-within:ring-2 focus-within:ring-blue-500"
        onClick={() => setOpen(v => !v)}
      >
        {!open && selectedStaff ? (
          <div className="flex items-center justify-between flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-slate-800 font-medium truncate">{selectedStaff.label}</span>
              {selectedStaff.sublabel && (
                <span className="text-slate-400 text-xs shrink-0">{selectedStaff.sublabel}</span>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear() }}
              className="p-0.5 hover:bg-slate-100 rounded text-slate-400 ml-2 shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <input
            autoFocus={open}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 outline-none bg-transparent text-sm"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(true)
            }}
          />
        )}
        {!selectedStaff && (
          <ChevronDown size={16} className="text-slate-400 shrink-0 ml-2" />
        )}
      </div>

      {open && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200
                       rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {filteredStaff.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-400">{notFoundText}</li>
          ) : (
            filteredStaff.map(item => (
              <li
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-50
                  ${item.id === value
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-700'
                  }`}
              >
                <span>{item.label}</span>
                {item.sublabel && (
                  <span className="text-slate-400 text-xs ml-2">{item.sublabel}</span>
                )}
              </li>
            ))
          )}

          {onCreate && (
            <li
              onClick={() => { setOpen(false); onCreate() }}
              className="px-3 py-2 text-sm cursor-pointer border-t border-slate-100
                         text-blue-600 hover:bg-blue-50 flex items-center gap-2 font-medium"
            >
              {CreateIcon && <CreateIcon size={14} />}
              {createLabel}
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

export default SearchCombobox