import { useFormContext } from 'react-hook-form'

const formatDuration = (totalMinutes) => {
  if (totalMinutes === 0) return '—'
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h > 0 && m > 0) return `${h} ч ${m} м`
  if (h > 0) return `${h} ч`
  return `${m} м`
}

const ServicesFooter = () => {
  const { watch } = useFormContext()
  const services = watch('services')

  const totalDuration = services.reduce((sum, s) => sum + (s.duration        || 0), 0)
  const totalPrice    = services.reduce((sum, s) => sum + (s.priceSnapshot   || 0), 0)
  const totalDiscount = services.reduce((sum, s) => sum + (s.discountValue   || 0), 0)
  const grandTotal    = services.reduce((sum, s) => sum + (s.total           || 0), 0)

  return (
    <div className="mt-3 pt-3 border-t border-slate-200">
      <div className="grid grid-cols-5 gap-2">

        <div>
          <p className="text-xs text-slate-400">Время</p>
          <p className="text-sm font-medium text-slate-700 mt-0.5">
            {formatDuration(totalDuration)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400">Сумма</p>
          <p className="text-sm font-medium text-slate-700 mt-0.5">
            {totalPrice.toLocaleString('ru-RU')} ₸
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400">Скидка</p>
          <p className="text-sm font-medium text-slate-700 mt-0.5">
            {totalDiscount > 0
              ? `−${totalDiscount.toLocaleString('ru-RU')} ₸`
              : '—'
            }
          </p>
        </div>

        <div /> {/* aligns with discount ₸ column */}

        <div>
          <p className="text-xs text-slate-400">Итого</p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {grandTotal.toLocaleString('ru-RU')} ₸
          </p>
        </div>

      </div>
    </div>
  )
}

export default ServicesFooter