import { useState, useRef, useMemo } from 'react'
import { ChevronDown, X } from 'lucide-react'
import FormLabel from './FormLabel'
import { useClickOutside } from './hooks/useClickOutside'
import { useVirtualizer } from '@tanstack/react-virtual'

const ItemRow = ({ item, isSelected, onClick, style }) => {
  return <li
    style={style}
    onClick={onClick}
    className={`w-full px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 flex items-center
      ${isSelected
    ? 'bg-blue-50 text-blue-700 font-medium'
    : 'text-slate-700'
}`
    }
  >
    <span>{item.label}</span>
    {item.sublabel && (
      <span className="text-slate-400 text-xs ml-2">{item.sublabel}</span>
    )}
  </li>
}

const SearchCombobox = ({
  // RHF field control
  value,       // current selected id
  onChange,           // (item | null) => void

  // Data
  items,              // [{ id, label, sublabel }]

  // Display
  label,
  placeholder,
  notFoundText,

  // 'create new' row at bottom of dropdown
  onCreate,
  createLabel,
  CreateIcon,
}) => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const listRef = useRef(null)

  useClickOutside(containerRef, () => setOpen(false))

  const selectedItem = useMemo(() =>
    items.find(i => i.id === value) ?? null,
  [items, value])

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(i =>
      i.label.toLowerCase().includes(q) ||
      i.sublabel?.toLowerCase().includes(q)
    )
  }, [items, query])

  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 36, // px per row
    overscan: 5
  })

  const handleSelect = (item) => {
    onChange(item)
    setQuery('')
    setOpen(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange(null)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {label && <FormLabel>{label}</FormLabel>}

      <div
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg
                   flex items-center justify-between cursor-pointer
                   focus-within:ring-2 focus-within:ring-blue-500"
        onClick={() => setOpen(v => !v)}
      >
        <div className='relative flex-1 flex items-center min-w-0'>
          <input
            autoFocus={open}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 outline-none bg-transparent text-sm"
            onClick={(e) => { e.stopPropagation(); setOpen(true) }}
          />
          {!open && selectedItem && (
            <div className="absolute inset-0 bg-white flex items-center gap-2 pointer-events-none">
              <span className="text-slate-800 font-medium truncate">{selectedItem.label}</span>
              {selectedItem.sublabel && (
                <span className="text-slate-400 text-xs shrink-0">{selectedItem.sublabel}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          {(selectedItem || query) && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {open && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white border border-slate-200
                       rounded-lg shadow-lg max-h-52 overflow-y-auto">
          <div style={{ height: virtualizer.getTotalSize() }} className="relative">
            {virtualizer.getVirtualItems().map(virtualRow => (
              <ItemRow
                key={virtualRow.key}
                style={{ position: 'absolute', top: virtualRow.start }}
                item={filteredItems[virtualRow.index]}
                isSelected={filteredItems[virtualRow.index].id === value}
                onClick={() => handleSelect(filteredItems[virtualRow.index])}
              />
            ))}
          </div>

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