import { Router } from 'express'
import { validate } from '../middlewares/validate.js'
import { createMasterSchema, masterParamsSchema, updateMasterSchema } from '../schemas/masterSchema.js'
import * as masterController from '../modules/masters/master.controller.js'
const router = Router()

router.get('/', masterController.getMaster)
router.get('/:id', validate({ params: masterParamsSchema }), masterController.getMasterById)
router.post('/', validate({ body: createMasterSchema }), masterController.createMaster)
router.patch('/:id', validate({ params: masterParamsSchema, body: updateMasterSchema }), masterController.updateMaster)

export default router