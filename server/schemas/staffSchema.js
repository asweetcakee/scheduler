const { z } = require('zod/v4')
const { dateQuery, idParamsSchema, phoneField, nameField } = require('./shared')

const staffDateQuerySchema = z.object({
  date: dateQuery.optional()
})

const staffPhoneQuerySchema = z.object({
  phone: phoneField
})

const staffParamsSchema = idParamsSchema

const baseStaffShape = {
  name: nameField, 
  phone: phoneField, 
  isActive: z.boolean().default(true),
  specializationIds: z.array(
    z.coerce.number().int().positive({ error: 'id must be a positive integer' }),
    { error: '\'specializationIds\' must be provided as a list' }
  )
}

const createStaffSchema = z.object(baseStaffShape)
const updateStaffSchema = z.object(baseStaffShape)

module.exports = {
  staffDateQuerySchema,
  staffPhoneQuerySchema,
  staffParamsSchema,
  createStaffSchema,
  updateStaffSchema
}