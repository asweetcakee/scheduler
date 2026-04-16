import { useSchedulerStore } from "../store/useSchedulerStore"

const TimeColumn = () => {
  const { slotHeight } = useSchedulerStore()
  const startHour = 7
  const endHour = 24

  const totalSlots = (endHour - startHour) * 4 // 15 min intervals
  const slots = Array.from({ length: totalSlots }, (_, i) => {
    const totalMinutes = i * 15
    const hour = Math.floor(totalMinutes / 60) + startHour
    const minutes = totalMinutes % 60
    return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  })

  
  console.log('Slots: ', slots)

  return (
    <div className="w-20 bg-slate-50 border-r border-slate-200">
      {slots.map((time, index) => {
        const minutes = time.slice(-2)
        const isFullHour = minutes === '00'
        const isHalfHour = minutes === '30'

        return (
          <div 
            key={index}
            style={{ height: `${slotHeight * 3}px` }} 
            className={`border-slate-200 flex items-center justify-end pr-2 select-none
              ${isFullHour ? 'border-t' : isHalfHour ? 'border-t border-dashed' : 'border-none'}
            `}
          >
            <span className={`text-[12px] text-right w-full
              ${isFullHour ? 'font-bold text-slate-600' : 'text-slate-400'}
            `}>
              {(isFullHour || isHalfHour) ? time : ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default TimeColumn