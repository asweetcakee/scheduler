const { getSchedulesByStaffId, getSchedulesByDate, createScheduleForStaff, updateSchedule, deleteSchedule } = require('../controllers/schedulesController')
const { getAllStaff, getStaffById, createStaffMember, updateStaffMember, deleteStaffMember, searchStaffMemberByPhone } = require('../controllers/staffController')

const staffRouter = require('express').Router()

staffRouter.get('/', getAllStaff)

staffRouter.get('/search', searchStaffMemberByPhone)
staffRouter.get('/schedules', getSchedulesByDate)

staffRouter.get('/:id', getStaffById)
staffRouter.get('/:id/schedules', getSchedulesByStaffId)

staffRouter.post('/', createStaffMember)
staffRouter.post('/:id/schedules', createScheduleForStaff)

staffRouter.put('/:id', updateStaffMember)
staffRouter.put('/:id/schedules/:date', updateSchedule)

staffRouter.delete('/:id', deleteStaffMember)
staffRouter.delete('/:id/schedules/:date', deleteSchedule)

module.exports = staffRouter