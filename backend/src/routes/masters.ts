import { Router } from 'express'
import { validate } from '../middlewares/validate.js'
import { createMasterSchema, masterParamsSchema, updateMasterSchema } from '../schemas/masterSchema.js'
import * as masterController from '../modules/masters/master.controller.js'
const router = Router()

router.get('/', masterController.getMasters)
router.get('/:id', validate({ params: masterParamsSchema }), masterController.getMasterById)
router.post('/', validate({ body: createMasterSchema }), masterController.createMaster)
router.patch('/:id', validate({ params: masterParamsSchema, body: updateMasterSchema }), masterController.updateMaster)
router.delete('/:id', validate({ params: masterParamsSchema }), masterController.removeMaster)

export default router