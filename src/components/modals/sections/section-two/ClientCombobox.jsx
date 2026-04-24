import { useFormContext } from "react-hook-form"
import { MOCK_CLIENTS } from "../../../../mocks/data"
import { useState } from "react"
import { UserPlus } from 'lucide-react'
import SearchCombobox from "../../../ui/SearchCombobox"
import CreateClientModal from '../sub-modals/CreateClientModal'
import FormFieldError from "../../../ui/FormFieldError"
import { transformClientsForCombobox } from "../../utils/modal-adapters"

const clientItems = transformClientsForCombobox(MOCK_CLIENTS)

const ClientCombobox = () => {
  const { setValue, watch, formState: { errors } } = useFormContext()
  const [showCreate, setShowCreate] = useState(false)

  const clientId = watch('clientId')

  const handleChange = (client) => {
    if (!client) {
      handleClear()
      return
    }

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
    console.log('new client: ', newClient)
  }

  return (
    <>
      <SearchCombobox
        value={clientId}
        onChange={handleChange}
        items={clientItems}
        label="Клиент"
        placeholder="Поиск по имени или телефону"
        notFoundText="Клиент не найден"
        onCreate={() => setShowCreate(true)}
        createLabel="Создать нового клиента"
        CreateIcon={UserPlus}
      />
      <FormFieldError error={errors?.clientName}/>

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