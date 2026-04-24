import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { UserPlus } from 'lucide-react'
import SearchCombobox from '../../../ui/SearchCombobox'
import CreateStaffModal from '../sub-modals/CreateStaffModal'
import { useSchedulerStore } from '../../../../store/useSchedulerStore'
import { MOCK_STAFF_MD } from '../../../../mocks/data'

const staffItems = MOCK_STAFF_MD.map(s => ({
  id: s.id,
  label: s.name,
  sublabel: s.role ?? undefined,
}))

const MasterCombobox = () => {
  const { setValue, watch, formState: { errors } } = useFormContext()
  const { modal } = useSchedulerStore()
  const [showCreate, setShowCreate] = useState(false)

  const staffId = watch('staffId')

  const handleChange = (staff) => {
    setValue('staffId', staff.id, { shouldValidate: true })

    // Restore seed startTime if reverting to original master
    if (staff.id === modal.seedData.staffId && modal.seedData.startTime) {
      setValue('startTime', modal.seedData.startTime)
    } else {
      setValue('startTime', '')
    }
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
        onClear={handleClear}
        items={staffItems}
        label="Мастер"
        placeholder="Поиск мастера..."
        notFoundText="Мастер не найден"
        onCreate={() => setShowCreate(true)}
        createLabel="Добавить мастера"
        CreateIcon={UserPlus}
      />
      {errors.staffId && (
        <p className="mt-1 text-xs text-red-500">{errors.staffId.message}</p>
      )}

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