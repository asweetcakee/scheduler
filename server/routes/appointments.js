const { getAllAppointments, getAppointmentsByDate, getAppointmentById, createAppointment, updateAppointment, deleteAppointment } = require('../controllers/appointmentsController')

const appointmentsRouter = require('express').Router()

appointmentsRouter.get('/', getAllAppointments) // ?date=2026-05-07
appointmentsRouter.get('/:id', getAppointmentById)

appointmentsRouter.post('/', createAppointment)
appointmentsRouter.put('/:id', updateAppointment)
appointmentsRouter.delete('/:id', deleteAppointment)

module.exports = appointmentsRouter