import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { UserPlus } from 'lucide-react'
import SearchCombobox from '../../../ui/SearchCombobox'
import CreateStaffModal from '../sub-modals/CreateStaffModal'
import { useSchedulerStore } from '../../../../store/useSchedulerStore'
import { MOCK_STAFF_MD } from '../../../../mocks/data'
import { transformStaffForCombobox } from '../../utils/modal-adapters'
import { resetStartTimeOnMasterChange } from '../../utils/modal-helpers'
import FormFieldError from '../../../ui/FormFieldError'

const staffItems = transformStaffForCombobox(MOCK_STAFF_MD)

const MasterCombobox = () => {
  const { setValue, watch, formState: { errors } } = useFormContext()
  const { modal } = useSchedulerStore()
  const [showCreate, setShowCreate] = useState(false)

  const staffId = watch('staffId')

  const handleChange = (staff) => {
    if (!staff) {
      handleClear()
      return
    }

    setValue('staffId', staff.id, { shouldValidate: true })

    // Restore seed startTime if reverting to original master
    const newTime = resetStartTimeOnMasterChange(staff.id, modal.seedData)
    setValue('startTime', newTime, { shouldValidate: true })
  }

  const handleClear = () => {
    setValue('staffId', null)
    setValue('startTime', '')
  }

  const handleCreated = (newStaff) => {
    setShowCreate(false)
    handleChange(newStaff)
    console.log('new staff: ', newStaff)
  }

  return (
    <>
      <SearchCombobox
        value={staffId}
        onChange={handleChange}
        items={staffItems}
        label="Мастер"
        placeholder="Поиск мастера..."
        notFoundText="Мастер не найден"
        onCreate={() => setShowCreate(true)}
        createLabel="Добавить мастера"
        CreateIcon={UserPlus}
      />
      <FormFieldError error={errors?.staffId}/>

      {showCreate && (
        <CreateStaffModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  )
}

export default MasterCombobox