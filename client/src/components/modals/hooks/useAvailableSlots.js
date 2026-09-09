import { useFormContext } from 'react-hook-form'
import { useSchedulerStore } from '../../../store/useSchedulerStore'
import { useEffect } from 'react'
import { mockSlots } from '../../../mocks/data' // TODO: remove after wiring with API call

export const useAvailableSlots = () => {
  const { watch } = useFormContext()
  const { setAvailableSlots, setIsFetchingSlots } = useSchedulerStore()

  const staffId = watch('staffId')
  const date = watch('date')

  useEffect(() => {
    if (!staffId || !date) return

    const fetchSlots = async() => {
      setIsFetchingSlots(true)
      try {
        // TODO: replace with real API call

        const slots = mockSlots
        setAvailableSlots(slots)

      } finally {
        setIsFetchingSlots(false)
      }
    }
    fetchSlots()
  }, [staffId, date, setAvailableSlots, setIsFetchingSlots])
}