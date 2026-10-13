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
    .min(1, 'Укажите время')
    .regex(
        /^([01]\d|2[0-3]):[0-5]\d$/,
        'Неверный формат времени ЧЧ:ММ'
    )
export type TimeFormat = z.infer<typeof timeSchema>

export const intervalFormSchema = z.strictObject({
    day_of_week: dayOfWeekField,
    starts_at: timeSchema,
    ends_at: timeSchema
}).refine(i => i.starts_at < i.ends_at, {
    error: 'Начало должно быть раньше конца',
    path: ['ends_at']
})

export const makeScheduleFormSchema = (today: ISODate, takenDates: ISODate[]) => {
    const day = z.array(intervalFormSchema)
    return z.object({
        effective_from: isoDateSchema
            .refine(d => d > today, { error: 'Дата должна быть позже сегодняшней' })
            .refine(d => !takenDates.includes(d), { error: 'На эту дату уже есть другая версия' }),
        intervals: z.object({ 1: day, 2: day, 3: day, 4: day, 5: day, 6: day, 7: day }),
    })
}