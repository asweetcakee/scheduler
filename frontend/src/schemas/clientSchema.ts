import { z } from 'zod/v4'

const nameField = z.string()
    .trim()
    .min(1, { error: 'Имя обязательно' })
    .max(200, { error: 'Имя слишком длинное' })

const phoneField = z.string()
    .regex(/^\d{10}$/, { error: 'Номер должен содержать ровно 10 цифр' })

const noteField = z.string()
    .trim()
    .max(2000, { error: 'Заметка слишком длинная' })
    .nullable()

export const clientSchema = z.strictObject({
    name: nameField,
    phone: phoneField,
    note: noteField
})

export type ClientForm = z.infer<typeof clientSchema>