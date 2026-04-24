import { useFormContext } from "react-hook-form"
import FormLabel from "../../../ui/FormLabel"
import FormFieldError from "../../../ui/FormFieldError"

const DateInput = () => {
  const { trigger, register, formState: { errors } } = useFormContext()
  return (
    <div>
      <FormLabel>Дата</FormLabel>
      <input
        {...register('date')}
        type="date"
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
        onBlur={() => trigger('date')}
      />
      <FormFieldError error={errors?.date}/>
    </div>
  )
}

export default DateInput