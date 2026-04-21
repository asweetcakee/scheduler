import { createContext, useContext } from 'react'

export const ClientContext = createContext(null)

export const useClientContext = () => {
  const ctx = useContext(ClientContext)
  if (!ctx) throw new Error('useClientContext must be used inside ClientCombobox')
  return ctx
}