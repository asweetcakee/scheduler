import { getHourToMinutesFormat } from '../../../utils/formatting'
import { calculateSlotTime } from './grid-calculations'
import { DISPLAY_RESOLUTION_MIN, GRID_RESOLUTION_MIN } from './time-config'

export const getSlotTime = (slotIndex, startHour) => {
  const { hour, minutes } = calculateSlotTime(slotIndex, startHour, GRID_RESOLUTION_MIN)
  return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

const generateSlots = (totalSlots, startHour, minutesPerSlot) => {
  return Array.from({ length: totalSlots }, (_, i) => {
    const { hour, minutes } = calculateSlotTime(i, startHour, minutesPerSlot)
    return getHourToMinutesFormat(hour, minutes)
  })
}

export const generateDisplaySlots = (totalSlots, startHour) =>
  generateSlots(totalSlots, startHour, DISPLAY_RESOLUTION_MIN)
