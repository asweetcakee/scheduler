import { z } from 'zod/v4'

const isoDateSchema = z.iso.date({ error: 'Date must follow YYYY-MM-DD format' })
export type ISODate = z.infer<typeof isoDateSchema>

export const calendarQuerySchema = z.strictObject({
    date: isoDateSchema
})
export type CalendarQuery = z.infer<typeof calendarQuerySchema>