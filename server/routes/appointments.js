const { getAllAppointments } = require('../controllers/appointmentsController')

const appointmentsRouter = require('express').Router()

appointmentsRouter.get('/', getAllAppointments)

module.exports = appointmentsRouter