import { MIN_PER_HOUR, GRID_RESOLUTION_MIN, DISPLAY_RESOLUTION_MIN } from './time-config'

const calculateSlotsPerHour = (minutesPerSlot) => {
  if (MIN_PER_HOUR % minutesPerSlot !== 0) {
    throw new Error(`Invalid slot size: ${minutesPerSlot} does not evenly divide 60`)
  }

  return MIN_PER_HOUR / minutesPerSlot
}

const calculateTotalSlots = (startHour, endHour, minutesPerSlot) => {
  const totalHours = endHour - startHour
  return totalHours * calculateSlotsPerHour(minutesPerSlot)
}

export const calculateTotalSlotsForGrid = (startHour, endHour) =>
  calculateTotalSlots(startHour, endHour, GRID_RESOLUTION_MIN)

export const calculateTotalSlotsForDisplay = (startHour, endHour) =>
  calculateTotalSlots(startHour, endHour, DISPLAY_RESOLUTION_MIN)

export const calculateGridHeight = (totalSlots, slotHeight) => {
  return totalSlots * slotHeight
}

export const calculateSlotTime = (slotIndex, startHour, minutesPerSlot) => {
  const totalMinutes = slotIndex * minutesPerSlot
  const hour = Math.floor(totalMinutes / MIN_PER_HOUR) + startHour
  const minutes = totalMinutes % MIN_PER_HOUR

  return { hour, minutes }
}

export const calculateHeightForMinutes = (minutes, slotHeight) => {
  return (minutes / GRID_RESOLUTION_MIN) * slotHeight
}

export const calculateDisplaySlotHeight = (slotHeight) => {
  const heightMultiplier = DISPLAY_RESOLUTION_MIN / GRID_RESOLUTION_MIN
  return slotHeight * heightMultiplier
}
