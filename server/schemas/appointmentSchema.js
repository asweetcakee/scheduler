const { z } = require('zod/v4')
const { dateQuery, idParamsSchema, idParam, timeField, isEndAfterStart, nameField, discountPercentField } = require('./shared')

const appointmentDateSchema = dateQuery
const appointmentParamsSchema = idParamsSchema

const appointmentBaseSchema = z.object({
  clientId: z.number().int().positive().nullable().default(null),
  staffId: idParam,
  date: dateQuery,
  startTime: timeField,
  endTime: timeField,
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
  isConfirmed: z.boolean().default(false),
  adminNotes: z.string().max(255).optional(),
  actualRevenue: z.number().min(0),
  services: z.array(z.object({
    serviceId: idParam,
    serviceName: z.string().min(1, { error: 'Service name is required' }).max(200),
    catalogDuration: z.number().int().min(5),
    catalogPrice: z.number().positive(),
    appliedDiscount: discountPercentField,
    actualChargedPrice: z.number().min(0)
  })).min(1, { error: 'At least one service is required' })
}).refine(isEndAfterStart('startTime', 'endTime'), { error: 'endTime must be later than startTime' })

const createAppointmentSchema = appointmentBaseSchema
const updateAppointmentSchema = appointmentBaseSchema

module.exports = {
  appointmentDateSchema,
  appointmentParamsSchema,
  createAppointmentSchema,
  updateAppointmentSchema
}