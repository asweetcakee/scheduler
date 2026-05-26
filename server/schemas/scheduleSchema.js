const { z } = require('zod/v4')
const { dateQuery, timeField, idParam } = require('./shared')

const isEndAfterStart = (data) => {
  const [startH, startM] = data.shiftStart.split(':').map(Number)
  const [endH, endM] = data.shiftEnd.split(':').map(Number)
  const startTime = startH * 60 + startM
  const endTime = endH * 60 + endM
  return endTime > startTime
}

const createScheduleSchema = z.object({
  date: dateQuery,
  shiftStart: timeField,
  shiftEnd: timeField,
  isCancelled: z.boolean().default(false),
  notes: z.string().max(255).nullable().default(null)
}).refine(isEndAfterStart, { error: 'shiftEnd must be later than shiftStart' })

const updateScheduleSchema = z.object({
  shiftStart: timeField,
  shiftEnd: timeField,
  isCancelled: z.boolean().default(false),
  notes: z.string().max(255).nullable().default(null)
}).refine(isEndAfterStart, { error: 'shiftEnd must be later than shiftStart' })

module.exports = {
  createScheduleSchema,
  updateScheduleSchema
}