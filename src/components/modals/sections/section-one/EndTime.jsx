import { useFormContext } from "react-hook-form"

const EndTime = () => {
  const { register, formState: { errors } } = useFormContext()
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Конец
      </label>
      <input
        {...register('endTime')}
        type="text"
        readOnly
        disabled
        placeholder="—"
        className="w-full px-3 py-2 text-sm border border-slate-100 rounded-lg
                    bg-slate-50 text-slate-400 cursor-not-allowed"
      />
    </div>
  )
}

export default EndTime