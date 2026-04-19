import { format } from "date-fns"
import { useSchedulerStore } from "../../store/useSchedulerStore"

const StaffColumn = ({ staff }) => {
  const { startHour, endHour, slotHeight, openCreateModal, selectedDate } = useSchedulerStore()
  const totalHours = endHour - startHour
  const totalSlots = totalHours * 12 // 12 slots of 5-mins per hour
  const totalHeight = totalSlots * slotHeight

  const handleSlotClick = (slotIndex) => {
    const totalMinutes = slotIndex * 5
    const hour = Math.floor(totalMinutes / 60) + startHour
    const minutes = totalMinutes % 60
    const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    const dateString = format(selectedDate, 'yyyy-MM-dd')

    console.log(`Open modal for ${staff.name} at ${timeString}`)
    openCreateModal({
      staffId: staff.id,
      date: dateString,
      startTime: timeString
    })
  }

  return (
    <div className="flex flex-col flex-1 min-w-[200px] border-r border-slate-200">
      <div className="sticky top-0 z-10 h-16 bg-white flex items-center justify-center font-medium shadow-sm">
        {staff.name}
      </div>

      <div 
        className="relative w-full bg-white group"
        style={{
          height: `${totalHeight}px`,
          backgroundImage: `
            linear-gradient(to bottom, #e2e8f0 1px, transparent 1px),
            linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)
          `,
          backgroundSize: `100% ${slotHeight * 12}px, 100% ${slotHeight * 6}px`,
          backgroundPosition: '0 0px'
        }}
      >
        {/* INTERACTION LAYER: Mapping invisible 5-min hit zones */}
        <div className="absolute inset-0 flex flex-col">
          {Array.from({ length: totalSlots }).map((_, i) => (
            <div
              key={i}
              style={{ height: `${slotHeight}px` }}
              className="w-full cursor-pointer hover:bg-blue-500/10 transition-colors"
              onClick={() => handleSlotClick(i)}
              title={`Add appointment at slot ${i}`} // tooltip for debugging, can be removed later
            />
          ))}
        </div>

        {/* AppointmentBlocks will go here later - needs higher z-index than interaction layer */}
      </div>
    </div>
  )
}

export default StaffColumn