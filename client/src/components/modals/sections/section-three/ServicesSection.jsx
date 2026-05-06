import { useFormContext, useFieldArray } from 'react-hook-form'
import { Plus } from 'lucide-react'
import ServiceRow from './ServiceRow'
import ServicesFooter from './ServicesFooter'
import { useEndTimeCalculation } from '../../hooks/useEndTimeCalculation'

const EMPTY_SERVICE = {
  serviceId:       null,
  duration:        0,
  priceSnapshot:   0,
  discountPercent: 0,
  discountValue:   0,
  total:           0,
}

const ServicesSection = () => {
  const { control, formState: { errors } } = useFormContext()

  // Lives here because both its triggers (startTime + services.duration)
  // are readable from this subtree — section-three owns the services,
  // startTime is watched cross-section via useFormContext
  useEndTimeCalculation()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services',
  })

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Услуги
        </h3>
        <button
          type="button"
          onClick={() => append({ ...EMPTY_SERVICE })}
          className="flex items-center gap-1.5 text-xs text-blue-600
                     hover:text-blue-700 font-medium transition-colors"
        >
          <Plus size={14} />
          Добавить услугу
        </button>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <ServiceRow
            key={field.id}
            index={index}
            onRemove={() => remove(index)}
            canRemove={fields.length > 1}
          />
        ))}
      </div>

      {errors.services?.root && (
        <p className="mt-2 text-xs text-red-500">{errors.services.root.message}</p>
      )}

      {fields.length > 1 && <ServicesFooter />}
    </section>
  )
}

export default ServicesSection