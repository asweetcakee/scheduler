const { getAllAppointments, getAppointmentsByDate, getAppointmentById, createAppointment, updateAppointment, deleteAppointment } = require('../controllers/appointmentsController')
const { appointmentDateSchema, appointmentParamsSchema, createAppointmentSchema, updateAppointmentSchema } = require('../schemas/appointmentSchema')
const { validateQuery, validateParams, validateBody } = require('../utils/middleware')

const appointmentsRouter = require('express').Router()

appointmentsRouter.get('/', validateQuery(appointmentDateSchema), getAllAppointments) // ?date=2026-05-07
appointmentsRouter.get('/:id', validateParams(appointmentParamsSchema), getAppointmentById)

appointmentsRouter.post('/', validateBody(createAppointmentSchema), createAppointment)
appointmentsRouter.put('/:id', validateParams(appointmentParamsSchema), validateBody(updateAppointmentSchema), updateAppointment)
appointmentsRouter.delete('/:id', validateParams(appointmentParamsSchema), deleteAppointment)

module.exports = appointmentsRouter