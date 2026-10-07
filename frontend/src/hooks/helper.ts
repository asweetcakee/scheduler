import type { ISODate } from '../schemas/scheduleSchema'

const BUSINESS_TIME_ZONE = 'Asia/Almaty'

export const getToday = (): ISODate =>
  new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIME_ZONE }).format(new Date())