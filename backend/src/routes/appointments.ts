import { Router } from 'express'
import { validate } from '../middlewares/validate.js'
import { appointmentParamsSchema, appointmentBodySchema, changeStatusBodySchema, availableMastersQuerySchema } from '../schemas/appointmentSchema.js'
import * as appointmentController from '../modules/appointments/appointments.controller.js'

const router = Router()

router.get('/available-masters', validate({ query: availableMastersQuerySchema }), appointmentController.getAvailableMasters)
router.get('/:id', validate({ params: appointmentParamsSchema }), appointmentController.getAppointmentById)
router.post('/', validate({ body: appointmentBodySchema }), appointmentController.createAppointment)
router.put('/:id', validate({ params: appointmentParamsSchema, body: appointmentBodySchema }), appointmentController.updateAppointment)
router.patch('/:id/status', validate({ params: appointmentParamsSchema, body: changeStatusBodySchema }), appointmentController.changeAppointmentStatus)
router.delete('/:id', validate({ params: appointmentParamsSchema }), appointmentController.removeAppointment)

export default router