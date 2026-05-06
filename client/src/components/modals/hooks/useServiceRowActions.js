import { useCallback } from 'react'
import { useFormContext } from 'react-hook-form'

export const useServiceRowActions = (index) => {
  const { setValue } = useFormContext()

  const updateRow = useCallback((data) => {
    Object.entries(data).forEach(([key, val]) => {
      setValue(`services.${index}.${key}`, val, key === 'serviceId' ? { shouldValidate: true } : {})
    })
  }, [index, setValue])

  return { updateRow }
}