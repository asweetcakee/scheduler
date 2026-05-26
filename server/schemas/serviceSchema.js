const { z } = require('zod/v4')
const { idParamsSchema, nameField } = require('./shared')

const serviceParamsSchema = idParamsSchema

const createServiceSchema = z.object({
  name: nameField,
  duration: z.number().int().min(5, { error: 'Duration must be at least 5 minutes' }),
  price: z.number().positive({ error: 'Price must be a positive number' })
})

const updateServiceSchema = createServiceSchema.extend({
  isActive: z.boolean().optional().default(true)
})

module.exports = {
  serviceParamsSchema,
  createServiceSchema,
  updateServiceSchema
}