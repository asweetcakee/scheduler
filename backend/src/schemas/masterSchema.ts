import { boolean, z } from 'zod/v4'

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

const activeField = z.boolean()

export const createMasterSchema = z.strictObject({
    name: nameField,
    phone: phoneField,
    active: activeField.optional()
})

export const masterParamsSchema = z.strictObject({
    id: idParam
})

export const updateMasterSchema = z.strictObject({
    name: nameField.optional(),
    phone: phoneField.optional(),
    active: activeField.optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        error: 'At least one field must be provided'
    }
)

export type UpdateMasterInput = z.infer<typeof updateMasterSchema>