import { z } from 'zod/v4'

const idParam = z.coerce
    .number()
    .int()
    .positive({ error: 'ID must be a positive integer' })

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

export const createScheduleSchema = z.strictObject({
    day_of_week: dayOfWeekField,
    starts_at: timeSchema,
    ends_at: timeSchema
})

export const scheduleParamsSchema = z.strictObject({
    id: idParam
})