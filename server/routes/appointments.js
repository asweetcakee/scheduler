const { getAllAppointments } = require('../controllers/appointments')

const appointmentsRouter = require('express').Router()

appointmentsRouter.get('/', getAllAppointments)

module.exports = appointmentsRouter