import { z } from 'zod/v4'

const nameField = z.string()
    .trim()
    .min(1, { error: 'Имя обязательно' })
    .max(200, { error: 'Имя слишком длинное' })

const phoneField = z.string()
    .regex(/^\d{10}$/, { error: 'Номер должен содержать ровно 10 цифр' })

const activeField = z.boolean()

export const masterSchema = z.strictObject({
    name: nameField,
    phone: phoneField,
    active: activeField.optional().default(true)
})

export type MasterFormInput = z.input<typeof masterSchema>
export type MasterForm = z.output<typeof masterSchema> 