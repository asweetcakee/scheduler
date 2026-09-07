import * as clientController from '../modules/clients/client.controller.js'
import { Router } from 'express'
import { validate } from '../middlewares/validate.js'
import { clientParamsSchema, clientPhoneQuerySchema, createClientSchema } from '../schemas/clientSchema.js'

const router = Router()

router.get('/', validate({ query: clientPhoneQuerySchema }), clientController.getClients)
router.get('/:id', validate({ params: clientParamsSchema }), clientController.getClientById)
router.post('/', validate({ body: createClientSchema }), clientController.createClient)

export default router