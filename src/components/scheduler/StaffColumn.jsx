import { useSchedulerStore } from "../store/useSchedulerStore"

const StaffColumn = ({ staff }) => {
  // Depending on the number of staff in MOCK_STAFF, the column width in StaffColumn (currently set to min-w-[200px]) may need to be adjusted to fit the layout properly.
  // Write here an adaptive calculation for column width

  const { startHour, endHour, slotHeight } = useSchedulerStore()
  const totalHours = endHour - startHour
  const totalHeight = totalHours * (60 / 5) * slotHeight // total hours * number of 5-min slots per hour * height of each slot

  return (
    <div className="flex flex-col flex-1 min-w-[200px] border-r border-slate-200">

      <div className="sticky top-0 z-10 h-16 bg-white 
                      flex items-center justify-center font-medium">
        {staff.name}
      </div>

      <div 
        className="h-max relative w-full bg-white"
        style={{
          height: `${totalHeight}px`,
          backgroundImage: `
            linear-gradient(to bottom, #e2e8f0 1px, transparent 1px),
            linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)
          `,
          backgroundSize: `100% ${slotHeight * 12}px, 100% ${slotHeight * 6}px`
        }}
      >
        {/* AppointmentBlock components will be absolutely positioned here */}
      </div>

    </div>
  )
}

export default StaffColumn