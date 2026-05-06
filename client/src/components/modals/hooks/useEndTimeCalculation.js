import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { addMinutes, format, parse, isValid } from 'date-fns'

export const useEndTimeCalculation = () => {
  const { watch, setValue } = useFormContext()

  const startTime = watch('startTime')
  const services  = watch('services')

  // Primitive derived value - safe in deps array, no stale reference problem
  const totalDuration = services.reduce((sum, s) => sum + (s.duration || 0), 0)

  useEffect(() => {
    if (!startTime || totalDuration === 0) {
      setValue('endTime', '')
      return
    }

    const base = parse(startTime, 'HH:mm', new Date())
    if (!isValid(base)) {
      setValue('endTime', '')
      return
    }

    setValue('endTime', format(addMinutes(base, totalDuration), 'HH:mm'))
  }, [startTime, totalDuration])
}