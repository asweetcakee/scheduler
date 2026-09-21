import { Router } from 'express'
import { validate } from '../middlewares/validate.js'
import { createServiceSchema, serviceParamsSchema, updateServiceSchema } from '../schemas/serviceSchema.js'
import * as serviceController from '../modules/services/service.controller.js'

const router = Router()
router.get('/', serviceController.getServices)
router.get('/:id', validate({ params: serviceParamsSchema }), serviceController.getServiceById)
router.post('/', validate({ body: createServiceSchema }), serviceController.createService)
router.patch('/:id', validate({ params: serviceParamsSchema, body: updateServiceSchema }), serviceController.updateService)
router.delete('/:id', validate({ params: serviceParamsSchema }), serviceController.removeService)

export default router