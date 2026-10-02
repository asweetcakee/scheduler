import { Router } from 'express'
import { validate } from '../middlewares/validate.js'
import { createMasterSchema, masterParamsSchema, updateMasterSchema } from '../schemas/masterSchema.js'
import * as masterController from '../modules/masters/master.controller.js'
import * as scheduleController from '../modules/masters/schedule/schedule.controller.js'
import { createScheduleSchema, deleteScheduleParamsSchema, scheduleParamsSchema, updateScheduleParamsSchema, updateScheduleSchema } from '../schemas/scheduleSchema.js'
const router = Router()

router.get('/', masterController.getMasters)
router.get('/:id', validate({ params: masterParamsSchema }), masterController.getMasterById)
router.get('/:id/schedule', validate({ params: masterParamsSchema }), scheduleController.getIntervals)
router.post('/', validate({ body: createMasterSchema }), masterController.createMaster)
router.post('/:id/schedule/intervals', validate({ params: masterParamsSchema, body: createScheduleSchema }), scheduleController.createInterval)
router.patch('/:id', validate({ params: masterParamsSchema, body: updateMasterSchema }), masterController.updateMaster)
router.patch('/:id/schedule/intervals/:intervalId', validate({ params: updateScheduleParamsSchema, body: updateScheduleSchema }), scheduleController.updateInterval)
router.delete('/:id', validate({ params: masterParamsSchema }), masterController.removeMaster)
router.delete('/:id/schedule/intervals/:intervalId', validate({ params: deleteScheduleParamsSchema }), scheduleController.removeInterval)

export default router