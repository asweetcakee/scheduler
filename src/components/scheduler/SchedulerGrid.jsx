import TimeColumn from './TimeColumn'
import StaffColumn from './StaffColumn'
import { MOCK_STAFF_SM } from '../../mocks/data.js'

const SchedulerGrid = () => {
  return (
    <div className="relative h-full w-full overflow-auto">
      <div className="flex">

        {/* Time column + corner block in one sticky element */}
        <div className="sticky left-0 z-20 flex flex-col">
          <div className="sticky top-0 z-30 w-20 h-16 bg-white border-b border-b-white border-r border-r-slate-200" />
          <TimeColumn />
        </div>

        {MOCK_STAFF_SM.map(staff => (
          <StaffColumn key={staff.id} staff={staff} />
        ))}

      </div>

    </div>
  )
}

export default SchedulerGrid
