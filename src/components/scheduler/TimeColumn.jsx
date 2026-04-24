import { useSchedulerStore } from '../../store/useSchedulerStore'
import { calculateDisplaySlotHeight, calculateTotalSlotsForDisplay } from './utils/grid-calculations'
import { generateDisplaySlots } from './utils/grid-helper'

const TimeColumn = () => {
  const { slotHeight, startHour, endHour } = useSchedulerStore()
  const totalSlots = calculateTotalSlotsForDisplay(startHour, endHour)
  const slots = generateDisplaySlots(totalSlots, startHour)
  const displayUnitHeight = calculateDisplaySlotHeight(slotHeight)

  return (
    <div className="w-20 bg-slate-50 border-r border-slate-200">
      {slots.map((time, index) => {
        const minutes = time.slice(-2)
        const isFullHour = minutes === '00'
        const isHalfHour = minutes === '30'

        return (
          <div
            key={index}
            style={{ height: `${displayUnitHeight}px` }}
            className={`border-slate-200 flex justify-end pr-2 select-none
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