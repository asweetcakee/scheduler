import { Router } from 'express'
import { validate } from '../middlewares/validate.js'
import { appointmentParamsSchema, appointmentBodySchema, changeStatusBodySchema } from '../schemas/appointmentSchema.js'
import * as appointmentController from '../modules/appointments/appointments.controller.js'

const router = Router()

router.get('/:id', validate({ params: appointmentParamsSchema }), appointmentController.getAppointmentById)
router.post('/', validate({ body: appointmentBodySchema }), appointmentController.createAppointment)
router.put('/:id', validate({ params: appointmentParamsSchema, body: appointmentBodySchema }), appointmentController.updateAppointment)
router.patch('/:id/status', validate({ params: appointmentParamsSchema, body: changeStatusBodySchema }), appointmentController.changeAppointmentStatus)

export default router