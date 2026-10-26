import { Router } from 'express'
import { validate } from '../middlewares/validate.js'
import { calendarQuerySchema } from '../schemas/calendarSchema.js'
import * as calendarController from '../modules/calendar/calendar.controller.js'

const router = Router()

router.get('/', validate({ query: calendarQuerySchema }), calendarController.getCalendar)

export default router