import { z } from 'zod/v4'

const idParam = z
    .coerce
    .number()
    .int()
    .positive({ error: 'ID must be a positive integer' })

const nameField = z.string()
    .trim()
    .min(1, { error: 'Name is required' })
    .max(200, { error: 'Name is too long' })

const phoneField = z.string()
    .trim()
    .regex(/^\d{10}$/, {
        error: 'Phone must be exactly 10 digits',
    })

const noteField = z.string()
    .trim()
    .max(2000, { error: 'Note is too long' })
    .nullable()

export const createClientSchema = z.strictObject({
    name: nameField,
    phone: phoneField,
    note: noteField.optional()
})

export const clientParamsSchema = z.strictObject({
    id: idParam
})

export const clientPhoneQuerySchema = z.strictObject({
    phone: phoneField.optional()
})

export const updateClientSchema = z.strictObject({
    name: nameField.optional(),
    phone: phoneField.optional(),
    note: noteField.optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        error: 'At least one field must be provided'
    }
)