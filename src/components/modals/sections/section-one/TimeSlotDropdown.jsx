import { useFormContext, Controller } from 'react-hook-form'
import { useSchedulerStore } from '../../../../store/useSchedulerStore'
import FormFieldError from '../../../ui/FormFieldError'
import FormLabel from '../../../ui/FormLabel'

const SELECT_CLASSES = `w-full px-3 py-2 text-sm border border-slate-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white
                       disabled:bg-slate-50 disabled:text-slate-400`

const TimeSlotDropdown = () => {
  const { control, formState: { errors } } = useFormContext()
  const { modalRuntime } = useSchedulerStore()
  const { availableSlots, isFetchingSlots } = modalRuntime

  const hasNoSlots = availableSlots.length === 0
  const isDisabled = isFetchingSlots || hasNoSlots

  const placeholderText = isFetchingSlots
    ? 'Загрузка...'
    : hasNoSlots
      ? 'Нет свободных слотов'
      : 'Выберите время'

  const renderTimeSelect = ({ field }) => (
    <select {...field} disabled={isDisabled} className={SELECT_CLASSES}>

      <option value=""> {placeholderText} </option>

      {availableSlots.map(slot => (
        <option key={slot} value={slot}>{slot}</option>
      ))}

    </select>
  )

  return (
    <div>
      <FormLabel>Начало</FormLabel>
      <Controller
        name='startTime'
        control={control}
        render={renderTimeSelect}
      />
      <FormFieldError error={errors?.startTime}/>
    </div>
  )
}

export default TimeSlotDropdown