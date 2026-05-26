const { z } = require('zod/v4')

const dateQuery = z.iso.date({ error: 'Date must be a valid ISO date in YYYY-MM-DD format' })
const timeField = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { error: 'Time must be in HH:MM format' })

const idParam = z.coerce.number().int().positive({ error: 'id must be a positive integer' })
const serviceIdParam = z.coerce.number().int().positive({ error: 'serviceId must be a positive integer' })

const nameField = z.string().trim().min(1, { error: 'Name is required' }).max(100, { error: 'Name too long' })

const phoneField = z.string()
  .trim()
  .min(7, { error: 'Phone must be at least 7 digits' })
  .max(15, { error: 'Phone must be at most 15 digits' })
  .regex(/^\d+$/, { error: 'Phone must contain digits only' })

const discountPercentField = z.number().int()
  .min(0, { error: 'Percent value must be within 0 and 100 boundary' })
  .max(100, { error: 'Percent value must be within 0 and 100 boundary' })
  .default(0)

const idParamsSchema = z.object({ id: idParam })

module.exports = { dateQuery, timeField, idParam, serviceIdParam, nameField, phoneField, discountPercentField, idParamsSchema }