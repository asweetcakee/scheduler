import { useFormContext, Controller } from "react-hook-form"
import { useSchedulerStore } from "../../../../store/useSchedulerStore"

const TimeSlotDropdown = () => {
  const { control, formState: { errors } } = useFormContext()
  const { modalRuntime } = useSchedulerStore()
  const { availableSlots, isFetchingSlots } = modalRuntime

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Начало
      </label>
      <Controller
        name="startTime"
        control={control}
        render={({ field }) => (
          <select
            {...field}
            disabled={isFetchingSlots || availableSlots.length === 0}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white
                       disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">
              {isFetchingSlots ? 'Загрузка...' : 'Выберите время'}
            </option>
            {availableSlots.map(slot => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        )}
      />
      {errors.startTime && (
        <p className="mt-1 text-xs text-red-500">{errors.startTime.message}</p>
      )}
    </div>
  )
}

export default TimeSlotDropdown