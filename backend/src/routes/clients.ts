import * as clientController from '../modules/clients/client.controller.js'
import { Router } from 'express'
import { validate } from '../middlewares/validate.js'
import { clientParamsSchema, clientPhoneQuerySchema, createClientSchema, updateClientSchema } from '../schemas/clientSchema.js'

const router = Router()

router.get('/', validate({ query: clientPhoneQuerySchema }), clientController.getClients)
router.get('/:id', validate({ params: clientParamsSchema }), clientController.getClientById)
router.post('/', validate({ body: createClientSchema }), clientController.createClient)
router.patch('/:id', validate({ params: clientParamsSchema, body: updateClientSchema }), clientController.updateClient)
router.delete('/:id', validate({ params: clientParamsSchema }), clientController.removeClient)

export default router