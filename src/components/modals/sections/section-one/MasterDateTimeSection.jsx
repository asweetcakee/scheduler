import { useAvailableSlots } from "../../hooks/useAvailableSlots"
import MasterCombobox from "./MasterCombobox"
import DateInput from "./DateInput"
import TimeSlotDropdown from "./TimeSlotDropdown"
import EndTime from "./EndTime"

const MasterDateTimeSection = () => {  
  // activates the watch -> fetch -> setAvailableSlots pipeline
  useAvailableSlots()
  
  return (
    <section>
      <div className="flex items-center justify-center">
        <div className="flex flex-col space-y-3">
          <MasterCombobox />
          <div className="flex flex-row space-x-3">
            <DateInput />
            <TimeSlotDropdown />
            <EndTime />
          </div>
        </div>
      </div>
    </section>
  )
}

export default MasterDateTimeSection