import { z } from 'zod/v4'

const idParam = z.coerce
    .number()
    .int()
    .positive({ error: 'ID must be a positive integer' })

export type ID = z.output<typeof idParam>

const isoDateSchema = z.iso.date({ error: 'Date must follow YYYY-MM-DD format' })
export type ISODate = z.infer<typeof isoDateSchema>

const dayOfWeekField = z
    .number()
    .int('День недели должен быть целым числом')
    .min(1, 'День недели не может быть меньше 1')
    .max(7, 'День недели не может быть больше 7')
export type DayOfWeek = z.infer<typeof dayOfWeekField>

const timeSchema = z.string()
    .regex(
        /^([01]\d|2[0-3]):[0-5]\d$/,
        'Invalid format'
    )
export type TimeFormat = z.infer<typeof timeSchema>

export const scheduleQuerySchema = z.strictObject({
    date: isoDateSchema
})

export const versionParamsSchema = z.strictObject({
    id: idParam,
    versionId: idParam
})

const intervalSchema = z.strictObject({
    day_of_week: dayOfWeekField,
    starts_at: timeSchema,
    ends_at: timeSchema
})
export type CreateIntervalInput = z.infer<typeof intervalSchema>

export const createVersionSchema = z.strictObject({
    effective_from: isoDateSchema,
    intervals: z.array(intervalSchema)
})

export const updateVersionSchema = z.strictObject({
    effective_from: isoDateSchema,
    intervals: z.array(intervalSchema)
})