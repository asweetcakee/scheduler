import { useFormContext } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import SearchCombobox from '../../../ui/SearchCombobox'
import { useSchedulerStore } from '../../../../store/useSchedulerStore'
import { MOCK_SERVICES } from '../../../../mocks/data'
import FormFieldError from '../../../ui/FormFieldError'

// 5-min increments up to 8 hours (480 min)
const DURATION_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const minutes = (i + 1) * 5
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const label = h > 0 && m > 0
    ? `${h} ч ${m} м`
    : h > 0 ? `${h} ч` : `${m} м`
  return { value: minutes, label }
})

// Shape once at module level - SearchCombobox speaks { id, label, sublabel }
const serviceItems = MOCK_SERVICES.map(service => ({
  id:       service.id,
  label:    service.name,
  sublabel: `${service.duration} м · ${service.price.toLocaleString('ru-RU')} ₸`,
}))

// Pure helpers - keep row logic readable
const roundToCents = (n) => parseFloat(n.toFixed(2))
const clamp  = (val, min, max) => Math.min(max, Math.max(min, val))

const ServiceRow = ({ index, onRemove, canRemove }) => {
  const { watch, setValue, formState: { errors } } = useFormContext()
  const { modalRuntime } = useSchedulerStore()

  const row       = watch(`services.${index}`)
  const rowErrors = errors.services?.[index]

  // ── Service selected ──────────────────────────────────────────────────────
  const handleServiceSelect = (item) => {
    const service = MOCK_SERVICES.find(s => s.id === item.id)
    if (!service) return

    const clientDiscount  = modalRuntime.clientDiscounts.find(d => {
      return d.serviceId === service.id
    })
    const discountPercent = clientDiscount?.discountPercent ?? 0
    const discountValue   = roundToCents(service.price * discountPercent / 100)
    const total           = roundToCents(service.price - discountValue)

    setValue(`services.${index}.serviceId`,        service.id,    { shouldValidate: true })
    setValue(`services.${index}.duration`,         service.duration)
    setValue(`services.${index}.priceSnapshot`,    service.price)
    setValue(`services.${index}.discountPercent`,  discountPercent)
    setValue(`services.${index}.discountValue`,    discountValue)
    setValue(`services.${index}.total`,            total)
  }

  const handleServiceClear = () => {
    setValue(`services.${index}.serviceId`,       null)
    setValue(`services.${index}.duration`,         0)
    setValue(`services.${index}.priceSnapshot`,    0)
    setValue(`services.${index}.discountPercent`,  0)
    setValue(`services.${index}.discountValue`,    0)
    setValue(`services.${index}.total`,            0)
  }

  // ── Price edited ──────────────────────────────────────────────────────────
  const handlePriceChange = (e) => {
    const price         = parseFloat(e.target.value) || 0
    const percent       = row.discountPercent ?? 0
    const discountValue = roundToCents(price * percent / 100)
    const total         = roundToCents(price - discountValue)

    setValue(`services.${index}.priceSnapshot`,   price)
    setValue(`services.${index}.discountValue`,   discountValue)
    setValue(`services.${index}.total`,           total)
  }

  // ── Discount % edited → recalculate value ─────────────────────────────────
  const handleDiscountPercentChange = (e) => {
    const percent       = clamp(parseFloat(e.target.value) || 0, 0, 100)
    const price         = row.priceSnapshot ?? 0
    const discountValue = roundToCents(price * percent / 100)
    const total         = roundToCents(price - discountValue)

    setValue(`services.${index}.discountPercent`,  percent)
    setValue(`services.${index}.discountValue`,    discountValue)
    setValue(`services.${index}.total`,            total)
  }

  // ── Discount value edited → back-calculate % ─────────────────────────────
  const handleDiscountValueChange = (e) => {
    const price         = row.priceSnapshot ?? 0
    const discountValue = clamp(parseFloat(e.target.value) || 0, 0, price)
    const percent       = price > 0 ? roundToCents(discountValue / price * 100) : 0
    const total         = roundToCents(price - discountValue)

    setValue(`services.${index}.discountValue`,    discountValue)
    setValue(`services.${index}.discountPercent`,  percent)
    setValue(`services.${index}.total`,            total)
  }

  return (
    <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-3">

      {/* Service selector row */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <SearchCombobox
            value={row.serviceId}
            onChange={handleServiceSelect}
            onClear={handleServiceClear}
            items={serviceItems}
            label="Услуга"
            placeholder="Поиск услуги..."
            notFoundText="Услуга не найдена"
          />
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50
                       rounded-lg transition-colors mb-0.5"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Numeric fields grid */}
      <div className="grid grid-cols-5 gap-2">

        {/* Duration */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Длительность</label>
          <select
            value={row.duration}
            onChange={e => setValue(`services.${index}.duration`, Number(e.target.value))}
            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value={0}>—</option>
            {DURATION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Цена ₸</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={row.priceSnapshot}
            onChange={handlePriceChange}
            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Discount % */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Скидка %</label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={row.discountPercent}
            onChange={handleDiscountPercentChange}
            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Discount value */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Скидка ₸</label>
          <input
            type="number"
            min="0"
            value={row.discountValue}
            onChange={handleDiscountValueChange}
            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Total — read-only */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Итого ₸</label>
          <div className="w-full px-2 py-1.5 text-xs border border-slate-100 rounded-lg
                          bg-white text-slate-800 font-semibold">
            {(row.total ?? 0).toLocaleString('ru-RU')}
          </div>
        </div>

      </div>

      <FormFieldError error={rowErrors?.serviceId}/>
    </div>
  )
}

export default ServiceRow