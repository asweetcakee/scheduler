const { z } = require('zod/v4')

const createServiceSchema = z.object({
  name: z.string().min(1, { error: 'Name cannot be empty' }),
  duration: z.number().int().min(5, { error: 'Duration must be at least 5 minutes' }),
  price: z.number().int().positive({ error: 'Price must be a positive integer in tiyins' })
})

const updateServiceSchema = z.object({
  name: z.string().min(1, { error: 'Name cannot be empty' }),
  duration: z.number().int().min(5, { error: 'Duration must be at least 5 minutes' }),
  price: z.number().int().positive({ error: 'Price must be a positive integer in tiyins' }),
  isActive: z.boolean().optional()
})

module.exports = {
  createServiceSchema,
  updateServiceSchema
}