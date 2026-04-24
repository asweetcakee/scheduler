import { useFormContext } from 'react-hook-form'
import FormLabel from '../../../ui/FormLabel'

const EndTime = () => {
  const { register } = useFormContext()
  return (
    <div>
      <FormLabel>Конец</FormLabel>
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