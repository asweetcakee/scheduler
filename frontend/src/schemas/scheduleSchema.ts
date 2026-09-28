import { z } from 'zod/v4'

const timeSchema = z.string()
    .regex(
        /^([01]\d|2[0-3]):[0-5]\d$/,
        'Неверный формат времени ЧЧ:ММ'
    )

export const intervalFormSchema = z.strictObject({
    starts_at: timeSchema,
    ends_at: timeSchema
})

export type IntervalForm = z.infer<typeof intervalFormSchema>