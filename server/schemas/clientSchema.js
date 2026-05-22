const { z } = require('zod/v4')

const phoneValidator = z.string()
  .min(7, { error: 'Phone must be at least 7 digits' })
  .max(15, { error: 'Phone must be at most 15 digits' })
  .regex(/^\d+$/, { error: 'Phone must contain digits only' })

const createClientSchema = z.object({
  phone: phoneValidator,
  name: z.string().min(1, { error: 'Name cannot be empty' }).optional(),
  isRegular: z.boolean().optional(),
  isAllergic: z.boolean().optional()
})

const updateClientSchema = z.object({
  phone: phoneValidator,
  name: z.string().min(1, { error: 'Name cannot be empty' }),
  isRegular: z.boolean().optional(),
  isAllergic: z.boolean().optional()
})

module.exports = {
  createClientSchema,
  updateClientSchema
}