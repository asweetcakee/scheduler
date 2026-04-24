import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { useSchedulerStore } from '../../../store/useSchedulerStore'
import { MOCK_CLIENT_DISCOUNTS } from '../../../mocks/data'

export const useClientDiscounts = () => {
  const { watch, setValue, getValues } = useFormContext()
  const { setClientDiscounts, setIsFetchingDiscounts } = useSchedulerStore()

  const clientId = watch('clientId')

  useEffect(() => {
    // Client cleared -> reset all discounts
    if (!clientId) {
      setClientDiscounts([])
      recomputeServices([], getValues, setValue)
      return
    }

    let cancelled = false

    const fetchDiscounts = async () => {
      setIsFetchingDiscounts(true)
      try {
        // TODO: replace with real API call
        // const res = await axios.get(`/api/clients/${clientId}/pricing-context`)
        // const discounts = res.data

        // Mock: find discounts for this client
        const discounts = MOCK_CLIENT_DISCOUNTS[clientId] ?? []
        setClientDiscounts(discounts)
        recomputeServices(discounts, getValues, setValue)
      } finally {
        if (!cancelled) setIsFetchingDiscounts(false)
      }
    }

    fetchDiscounts()
    return () => { cancelled = true }
  }, [clientId])
}

// Pure helper — recalculates all service rows when discounts change
const recomputeServices = (discounts, getValues, setValue) => {
  const services = getValues('services')
  if (!services?.length) return

  services.forEach((row, index) => {
    if (!row.serviceId) return

    const match = discounts.find(d => d.serviceId === row.serviceId)
    const discountPercent = match?.discountPercent ?? 0
    const discountValue = parseFloat((row.priceSnapshot * discountPercent / 100).toFixed(2))
    const total = parseFloat((row.priceSnapshot - discountValue).toFixed(2))

    setValue(`services.${index}.discountPercent`, discountPercent)
    setValue(`services.${index}.discountValue`, discountValue)
    setValue(`services.${index}.total`, total)
  })
}