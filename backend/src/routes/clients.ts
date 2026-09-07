import * as clientController from '../modules/clients/client.controller.js'
import { Router } from 'express'
import { validate } from '../middlewares/validate.js'
import { clientParamsSchema, createClientSchema } from '../schemas/clientSchema.js'

const router = Router()

router.get('/:id', validate({ params: clientParamsSchema }), clientController.getClientById)
router.post('/', validate({ body: createClientSchema }), clientController.createClient)

export default router