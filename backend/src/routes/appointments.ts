import { Router } from 'express'
import { validate } from '../middlewares/validate.js'
import { appointmentParamsSchema, createAppointmentBodySchema } from '../schemas/appointmentSchema.js'
import * as appointmentController from '../modules/appointments/appointments.controller.js'

const router = Router()

router.get('/:id', validate({ params: appointmentParamsSchema }), appointmentController.getAppointmentById)
router.post('/', validate({ body: createAppointmentBodySchema }), appointmentController.createAppointment)

export default router