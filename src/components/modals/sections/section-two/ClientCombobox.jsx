import { useState, useRef, useEffect, createContext, useMemo, useCallback } from 'react'
import { useFormContext } from 'react-hook-form'
import { MOCK_CLIENTS } from '../../../../mocks/data'
import CreateClientModal from './CreateClientModal'
import ComboboxControl from './ComboboxControl'
import ComboboxList from './ComboboxList'
import { ClientContext } from './ClientContext'

const ClientCombobox = () => {
  const { setValue, watch, formState: { errors } } = useFormContext()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const ref = useRef(null)

  const clientId = watch('clientId')
  const selectedClient = MOCK_CLIENTS.find(c => c.id === clientId)

  // Closes on outside click
  useEffect(() => {
    const handler = (e) => {
      if(!ref.current?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = query.trim() === ''
    ? MOCK_CLIENTS
    : MOCK_CLIENTS.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query)
      )

  const handleSelect = useCallback((client) => {
    setValue('clientId', client.id, { shouldValidate: true })
    setValue('clientName', client.name)
    setValue('clientPhone', client.phone)
    setQuery('')
    setOpen(false)
  }, [setValue])

  const handleClear = useCallback((e) => {
    e.stopPropagation()
    setValue('clientId', null)
    setValue('clientName', '')
    setValue('clientPhone', '')
    setQuery('')
  }, [setValue])

  // Called after CreateClientModal successfully creates a client
  const handleClientCreated = useCallback((newClient) => {
    setShowCreateModal(false)
    handleSelect(newClient)
  }, [handleSelect])

  const contextValue = useMemo(() => ({
    query, setQuery, open, setOpen, setShowCreateModal,
    clientId, selectedClient, filtered, handleSelect, handleClear
  }), [query, open, clientId, selectedClient, filtered, handleSelect, handleClear])

  return (
    <ClientContext.Provider value={contextValue}>
      <div ref={ref} className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-1">Клиент</label>
        
        <ComboboxControl />
        <ComboboxList />

        {errors.clientName && (
          <p className="mt-1 text-xs text-red-500">{errors.clientName.message}</p>
        )}
      </div>

      {showCreateModal && (
        <CreateClientModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleClientCreated}
        />
      )}
    </ClientContext.Provider>
  )
}

export default ClientCombobox