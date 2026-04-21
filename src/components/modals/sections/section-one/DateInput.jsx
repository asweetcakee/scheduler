import { useFormContext } from "react-hook-form"

const DateInput = () => {
  const { trigger, register, formState: { errors } } = useFormContext()
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Дата
      </label>
      <input
        {...register('date')}
        type="date"
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
        onBlur={() => trigger('date')}
      />
      {errors.date && (
        <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>
      )}
    </div>
  )
}

export default DateInput