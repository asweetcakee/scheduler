import { z } from 'zod/v4'

const idParam = z
    .coerce
    .number()
    .int()
    .positive({ error: 'ID must be a positive integer' })

const nameField = z.string()
    .trim()
    .min(1, { error: 'Service name is required' })
    .max(200, { error: 'Service name is too long' })

const priceField = z.string()
    .trim()
    .regex(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})$/, {
        error: 'Price must have exactly two decimal places (e.g., 3500.00)',
    })

const durationField = z.number()
    .int()
    .positive({ error: 'Duration must be a positive integer' })

export const createServiceSchema = z.strictObject({
    name: nameField,
    price: priceField,
    duration: durationField
})

