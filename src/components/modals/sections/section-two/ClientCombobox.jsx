import { useFormContext } from "react-hook-form"
import { MOCK_CLIENTS } from "../../../../mocks/data"
import { useState } from "react"
import { UserPlus } from 'lucide-react'
import SearchCombobox from "../../../ui/SearchCombobox"
import CreateClientModal from '../sub-modals/CreateClientModal'


const clientItems = MOCK_CLIENTS.map(i => ({
  id: i.id,
  label: i.name,
  sublabel: i.phone ?? undefined
}))

const ClientCombobox = () => {
  const { setValue, watch, formState: { errors } } = useFormContext()
  const [showCreate, setShowCreate] = useState(false)

  const clientId = watch('clientId')

  const handleChange = (client) => {
    setValue('clientId', client.id, { shouldValidate: true })
    setValue('clientName', client.label)
    setValue('clientPhone', client.sublabel ?? '')
  }

  const handleClear = () => {
    setValue('clientId', null)
    setValue('clientName', '')
    setValue('clientPhone', '')
  }

  const handleCreated = (newClient) => {
    setShowCreate(false)
    handleChange({ id: newClient.id, label: newClient.name, sublabel: newClient.phone })
  }

  return (
    <>
      <SearchCombobox
        value={clientId}
        onChange={handleChange}
        onClear={handleClear}
        items={clientItems}
        label="Клиент"
        placeholder="Поиск по имени или телефону"
        notFoundText="Клиент не найден"
        onCreate={() => setShowCreate(true)}
        createLabel="Создать нового клиента"
        CreateIcon={UserPlus}
      />
      {errors.clientName && (
        <p className="mt-1 text-xs text-red-500">{errors.clientName.message}</p>
      )}

      {showCreate && (
        <CreateClientModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  )
}

export default ClientCombobox