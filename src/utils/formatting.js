export const getHourToMinutesFormat = (hour, minutes) =>
  `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`