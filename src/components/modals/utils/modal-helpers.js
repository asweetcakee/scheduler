import { calculateSlotTime } from './modal-calculations'

export const resetStartTimeOnMasterChange = (id, seedData) => {
  return id === seedData?.staffId && seedData?.startTime
    ? seedData.startTime
    : ''
}

const formatToDurationTime = (minutes, hours) => {
  return hours > 0 && minutes > 0
    ? `${hours} ч ${minutes} м`
    : hours > 0 ? `${hours} ч` : `${minutes} м`
}

export const generateDurationOptions = (totalSlots) => {
  return Array.from({ length: totalSlots }, (_, i) => {
    const { totalMinutes, minutesToFormat, hoursToFormat } = calculateSlotTime(i, 5)
    const label = formatToDurationTime(minutesToFormat, hoursToFormat)
    return {
      value: totalMinutes,
      label
    }
  })
}