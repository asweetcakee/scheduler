const { z } = require('zod/v4')
const { dateQuery, timeField, idParam, isEndAfterStart } = require('./shared')

const scheduleParamsSchema = z.object({
  id: idParam,
  date: dateQuery
})

const scheduleFromQuerySchema = z.object({
  from: dateQuery
})

const createScheduleSchema = z.object({
  date: dateQuery,
  shiftStart: timeField,
  shiftEnd: timeField,
  isCancelled: z.boolean().default(false),
  notes: z.string().max(255).nullable().default(null)
}).refine(isEndAfterStart('shiftStart', 'shiftEnd'), { error: 'shiftEnd must be later than shiftStart' })

const updateScheduleSchema = z.object({
  shiftStart: timeField,
  shiftEnd: timeField,
  isCancelled: z.boolean().default(false),
  notes: z.string().max(255).nullable().default(null)
}).refine(isEndAfterStart('shiftStart', 'shiftEnd'), { error: 'shiftEnd must be later than shiftStart' })

module.exports = {
  scheduleParamsSchema,
  scheduleFromQuerySchema,
  createScheduleSchema,
  updateScheduleSchema
}