import { z } from 'zod/v4'

const idParam = z
    .coerce
    .number()
    .int()
    .positive({ error: 'ID must be a positive integer' })
export type ID = z.infer<typeof idParam>

const nameField = z.string()
    .trim()
    .min(1, { error: 'Service name is required' })
    .max(200, { error: 'Service name is too long' })
export type ServiceName = z.infer<typeof nameField>

const priceField = z.string()
    .trim()
    .regex(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/, {
        error: 'Price must be a non-negative number with up to two decimal places (e.g. 3500 or 3500.50)',
    })

const durationField = z.number()
    .int()
    .positive({ error: 'Duration must be a positive integer' })

export const createServiceSchema = z.strictObject({
    name: nameField,
    price: priceField,
    duration: durationField
})

export const serviceParamsSchema = z.strictObject({
    id: idParam
})

export const updateServiceSchema = z.strictObject({
    name: nameField.optional(),
    price: priceField.optional(),
    duration: durationField.optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        error: 'At least one field must be provided'
    }
)

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
