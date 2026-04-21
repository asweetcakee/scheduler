import { useEffect, useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import { MOCK_STAFF_MD } from "../../../../mocks/data"
import { ChevronDown } from "lucide-react"
import { useSchedulerStore } from "../../../../store/useSchedulerStore"

const MasterCombobox = () => {
  const { setValue, watch, formState: { errors } } = useFormContext()
  const { modal } = useSchedulerStore()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const staffId = watch('staffId')
  const selectedStaff = MOCK_STAFF_MD.find(s => s.id === staffId)

  // Closes on outside click
  useEffect(() => {
    const handler = (e) => {
      if(!ref.current?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = query.trim() === ''
    ? MOCK_STAFF_MD
    : MOCK_STAFF_MD.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))

  const handleSelect = (staff) => {
    setValue('staffId', staff.id, { shouldValidate: true })
    
    // If reverting to the original master, restore the seed startTime
    // Otherwise clear it. new master, new availability
    const seedStaffId = modal.seedData.staffId
    const seedStartTime = modal.seedData.startTime
    
    if (staff.id === seedStaffId && seedStartTime) {
      setValue('startTime', seedStartTime)
    } else {
      setValue('startTime', '')
    }

    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-slate-700 mb-1">Мастер</label>
      <div className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg
                   flex items-center justify-between cursor-pointer
                   focus-within:ring-2 focus-within:ring-blue-500"
        onClick={() => setOpen(v => !v)}
      >
        { !open && selectedStaff ? (
          <span className="text-slate-800">
            { selectedStaff.name }
          </span>
        ) : (
          <input 
            autoFocus={open}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск мастера"
            className="flex-1 outline-none bg-transparent text-sm"
            onClick={e => e.stopPropagation()}
          /> 
        )}
        <ChevronDown size={16} className="text-slate-400 shrink-0 ml-2" />
      </div>

      { open && (
        <ul className="relative z-50 w-full mt-1 bg-white border border-slate-200
                       rounded-lg shadow-lg max-h-48 overflow-y-auto">
          { filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-400">Мастер не найден</li>
          ) : (
            filtered.map( staff => {
              return <li 
                key={staff.id}
                onClick={() => handleSelect(staff)}
                className={
                  `px-3 py-2 text-sm cursor-pointer hover:bg-slate-50
                  ${staff.id === staffId 
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-700'}`
                }
              >
                { staff.name }
              </li>
            })
          )}
        </ul>
      )}

      {errors.staffId && (
        <p className="mt-1 text-xs text-red-500">{errors.staffId.message}</p>
      )}

    </div>
  )
}

export default MasterCombobox