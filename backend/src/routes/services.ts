import { Router } from 'express'
import { validate } from '../middlewares/validate.js'
import { createServiceSchema } from '../schemas/serviceSchema.js'
import * as serviceController from '../modules/services/service.controller.js'

const router = Router()
router.post('/', validate({ body: createServiceSchema }), serviceController.createService)

export default router