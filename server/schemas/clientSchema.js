const { z } = require('zod/v4')
const { idParamsSchema, nameField, phoneField } = require('./shared')

const clientParamsSchema = idParamsSchema

const searchByPhoneSchema = z.object({ phone: phoneField })

const createClientSchema = z.object({
  phone: phoneField,
  name: nameField.optional(),
  isRegular: z.boolean().optional().default(false),
  isAllergic: z.boolean().optional().default(false)
})

const updateClientSchema = z.object({
  phone: phoneField,
  name: nameField,
  isRegular: z.boolean().optional().default(false),
  isAllergic: z.boolean().optional().default(false)
})

module.exports = {
  clientParamsSchema,
  searchByPhoneSchema,
  createClientSchema,
  updateClientSchema
}