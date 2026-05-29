const { getNextScheduleForStaff, createScheduleForStaff, updateSchedule, deleteSchedule } = require('../controllers/schedulesController')
const { getAllStaff, getStaffById, createStaffMember, updateStaffMember, deleteStaffMember, searchStaffMemberByPhone } = require('../controllers/staffController')
const { createScheduleSchema, updateScheduleSchema, scheduleParamsSchema, scheduleFromQuerySchema } = require('../schemas/scheduleSchema')
const { staffDateQuerySchema, staffPhoneQuerySchema, staffParamsSchema, createStaffSchema, updateStaffSchema } = require('../schemas/staffSchema')
const { validateQuery, validateParams, validateBody } = require('../utils/middleware')

const staffRouter = require('express').Router()

staffRouter.get('/', validateQuery(staffDateQuerySchema), getAllStaff)

staffRouter.get('/search', validateQuery(staffPhoneQuerySchema), searchStaffMemberByPhone) // ?phone=77071234567

staffRouter.get('/:id', validateParams(staffParamsSchema), getStaffById)
staffRouter.get('/:id/schedules', validateParams(staffParamsSchema), validateQuery(scheduleFromQuerySchema), getNextScheduleForStaff)

staffRouter.post('/', validateBody(createStaffSchema), createStaffMember)
staffRouter.post('/:id/schedules', validateParams(staffParamsSchema), validateBody(createScheduleSchema), createScheduleForStaff)

staffRouter.put('/:id', validateParams(staffParamsSchema), validateBody(updateStaffSchema), updateStaffMember)
staffRouter.put('/:id/schedules/:date', validateParams(scheduleParamsSchema), validateBody(updateScheduleSchema), updateSchedule)

staffRouter.delete('/:id', validateParams(staffParamsSchema), deleteStaffMember)
staffRouter.delete('/:id/schedules/:date', validateParams(scheduleParamsSchema), deleteSchedule)

module.exports = staffRouter