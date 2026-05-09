const { getAllStaff, getStaffById, createStaffMember, updateStaffMember, deleteStaffMember, searchStaffMemberByPhone } = require('../controllers/staffController')

const staffRouter = require('express').Router()

staffRouter.get('/', getAllStaff)
staffRouter.get('/search', searchStaffMemberByPhone)
staffRouter.get('/:id', getStaffById)
staffRouter.post('/', createStaffMember)
staffRouter.put('/:id', updateStaffMember)
staffRouter.delete('/:id', deleteStaffMember)

module.exports = staffRouter