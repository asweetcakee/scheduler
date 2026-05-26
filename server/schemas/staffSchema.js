const { z } = require('zod/v4')
const { dateQuery, idParamsSchema, phoneField, nameField } = require('./shared')

const staffDateQuerySchema = dateQuery
const staffPhoneQuerySchema = z.object({
  phone: phoneField
})

const staffParamsSchema = idParamsSchema

const createStaffSchema = z.object({
  name: nameField, 
  phone: phoneField, 
  isActive: z.boolean().default(true),
  specializationIds: z.array(
    z.coerce.number().int().positive({ error: 'id must be a positive integer' }),
    { error: "Specialization IDs must be provided as a list" }
  ).default([])
})

const updateStaffSchema = z.object({
  name: nameField, 
  phone: phoneField, 
  isActive: z.boolean().default(true),
  specializationIds: z.array(
    z.coerce.number().int().positive({ error: 'id must be a positive integer' }),
    { error: "Specialization IDs must be provided as a list" }
  ).default([])
})

module.exports = {
  staffDateQuerySchema,
  staffPhoneQuerySchema,
  staffParamsSchema,
  createStaffSchema,
  updateStaffSchema
}