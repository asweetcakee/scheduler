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

const timeSchema = z.string()
    .regex(
        /^([01]\d|2[0-3]):[0-5]\d$/,
        'Invalid format'
    )

export const scheduleQuerySchema = z.strictObject({
    date: isoDateSchema
})

export const getVersionParamsSchema = z.strictObject({
    id: idParam,
    versionId: idParam
})

export const createIntervalSchema = z.strictObject({
    day_of_week: dayOfWeekField,
    starts_at: timeSchema,
    ends_at: timeSchema
})

export const intervalParamsSchema = z.strictObject({
    id: idParam
})

export const updateIntervalParamsSchema = z.strictObject({
    id: idParam,
    intervalId: idParam
})

export const updateIntervalSchema = z.strictObject({
    day_of_week: dayOfWeekField.optional(),
    starts_at: timeSchema.optional(),
    ends_at: timeSchema.optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    { error: 'At least one field must be provided' }
)

export type UpdateIntervalInput = z.infer<typeof updateIntervalSchema>

export const deleteIntervalParamsSchema = z.strictObject({
    id: idParam,
    intervalId: idParam
})

export type DeleteIntervalParams = z.infer<typeof deleteIntervalParamsSchema>