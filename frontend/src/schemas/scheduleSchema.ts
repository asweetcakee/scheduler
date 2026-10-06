import { z } from 'zod/v4'

const idParam = z.coerce
    .number()
    .int()
    .positive({ error: 'ID должен быть положительным целым числом' })
export type ID = z.infer<typeof idParam>

const isoDateSchema = z.iso.date({ error: 'Дата должна следовать формату ГГГГ-ММ-ДД' })
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
        'Неверный формат времени ЧЧ:ММ'
    )
export type TimeFormat = z.infer<typeof timeSchema>

export const intervalFormSchema = z.strictObject({
    starts_at: timeSchema,
    ends_at: timeSchema
})

export type IntervalForm = z.infer<typeof intervalFormSchema>