import { useFormContext } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import SearchCombobox from '../../../ui/SearchCombobox'
import { useSchedulerStore } from '../../../../store/useSchedulerStore'
import { MOCK_SERVICES } from '../../../../mocks/data'
import FormFieldError from '../../../ui/FormFieldError'
import { roundToCents, clamp, calculatePricing } from '../../utils/modal-calculations'
import { transformServicesForCombobox } from '../../utils/modal-adapters'
import { generateDurationOptions } from '../../utils/modal-helpers'
import { useServiceRowActions } from '../../hooks/useServiceRowActions'

// 5-min increments up to 8 hours (480 min or 96 slots)
const DURATION_OPTIONS = generateDurationOptions(96)

const serviceItems = transformServicesForCombobox(MOCK_SERVICES)

const ServiceRow = ({ index, onRemove, canRemove }) => {
  const { watch, setValue, formState: { errors } } = useFormContext()
  const { updateRow } = useServiceRowActions(index)
  const { modalRuntime } = useSchedulerStore()

  const row = watch(`services.${index}`)
  const rowErrors = errors.services?.[index]

  // ── Service selected ──────────────────────────────────────────────────────
  const handleServiceSelect = (item) => {
    if (!item) {
      handleServiceClear()
      return
    }
    const service = MOCK_SERVICES.find(s => s.id === item.id)
    if (!service) return

    const clientDiscount  = modalRuntime.clientDiscounts.find(d => {
      return d.serviceId === service.id
    })
    const discountPercent = clientDiscount?.discountPercent ?? 0
    const { discountValue, total } = calculatePricing(service.price, discountPercent)

    updateRow({
      serviceId: service.id,
      duration: service.duration,
      priceSnapshot: service.price,
      discountPercent: discountPercent,
      discountValue,
      total
    })
  }

  const handleServiceClear = () => {
    updateRow({
      serviceId: null,
      duration: 0,
      priceSnapshot: 0,
      discountPercent: 0,
      discountValue: 0,
      total: 0
    })
  }

  // ── Price edited ──────────────────────────────────────────────────────────
  const handlePriceChange = (e) => {
    const price = parseFloat(e.target.value) || 0
    const discountPercent = row.discountPercent ?? 0
    const { discountValue, total } = calculatePricing(price, discountPercent)

    updateRow({
      priceSnapshot: price,
      discountValue,
      total
    })
  }

  // ── Discount % edited → recalculate value ─────────────────────────────────
  const handleDiscountPercentChange = (e) => {
    const discountPercent = clamp(parseFloat(e.target.value) || 0, 0, 100)
    const price = row.priceSnapshot ?? 0
    const { discountValue, total } = calculatePricing(price, discountPercent)

    updateRow({
      discountPercent,
      discountValue,
      total
    })
  }

  // ── Discount value edited → back-calculate % ─────────────────────────────
  const handleDiscountValueChange = (e) => {
    const price = row.priceSnapshot ?? 0
    const discountValue = clamp(parseFloat(e.target.value) || 0, 0, price)
    const discountPercent = price > 0 ? roundToCents(discountValue / price * 100) : 0
    const total = roundToCents(price - discountValue)

    updateRow({
      discountValue,
      discountPercent,
      total
    })
  }

  return (
    <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-3">

      {/* Service selector row */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <SearchCombobox
            value={row.serviceId}
            onChange={handleServiceSelect}
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