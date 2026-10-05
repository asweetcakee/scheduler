import { Router } from 'express'
import { validate } from '../middlewares/validate.js'
import { createMasterSchema, masterParamsSchema, updateMasterSchema } from '../schemas/masterSchema.js'
import * as masterController from '../modules/masters/master.controller.js'
import * as scheduleController from '../modules/masters/schedule/schedule.controller.js'
import { createVersionSchema, versionParamsSchema, scheduleQuerySchema, updateVersionSchema } from '../schemas/scheduleSchema.js'
const router = Router()

router.get('/', masterController.getMasters)
router.get('/:id', validate({ params: masterParamsSchema }), masterController.getMasterById)

router.get('/:id/schedule', validate({ params: masterParamsSchema, query: scheduleQuerySchema }), scheduleController.getScheduleForDate)
router.get('/:id/schedule/versions', validate({ params: masterParamsSchema }), scheduleController.getVersionsForMaster)
router.get('/:id/schedule/versions/:versionId', validate({ params: versionParamsSchema }), scheduleController.getScheduleByVersionId)

router.post('/', validate({ body: createMasterSchema }), masterController.createMaster)
router.post('/:id/schedule/versions', validate({ params: masterParamsSchema, body: createVersionSchema }), scheduleController.createVersionForMaster)

router.patch('/:id', validate({ params: masterParamsSchema, body: updateMasterSchema }), masterController.updateMaster)
router.put('/:id/schedule/versions/:versionId', validate({ params: versionParamsSchema, body: updateVersionSchema }), scheduleController.updateVersionForMaster)

router.delete('/:id', validate({ params: masterParamsSchema }), masterController.removeMaster)
router.delete('/:id/schedule/versions/:versionId', validate({ params: versionParamsSchema }), scheduleController.removeVersionForMaster)

export default router