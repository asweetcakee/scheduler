import { Router } from 'express'
import { validate } from '../middlewares/validate.js'
import { createServiceSchema, serviceParamsSchema } from '../schemas/serviceSchema.js'
import * as serviceController from '../modules/services/service.controller.js'

const router = Router()
router.get('/', serviceController.getServices)
router.get('/:id', validate({ params: serviceParamsSchema }), serviceController.getServiceById)
router.post('/', validate({ body: createServiceSchema }), serviceController.createService)

export default router