const { getAllClients, getClientById, searchClientByPhone, createClient, updateClient, deleteClient } = require('../controllers/clientsController')
const { createClientDiscount, deleteClientDiscount, updateClientDiscount, getClientDiscounts } = require('../controllers/discountsController')
const { createClientSchema, updateClientSchema, searchByPhoneSchema, clientParamsSchema } = require('../schemas/clientSchema')
const { clientDiscountParamsSchema, createClientDiscountSchema, updateClientDiscountSchema } = require('../schemas/discountsSchema')
const { validateQuery, validateParams, validateBody } = require('../utils/middleware')

const clientsRouter = require('express').Router()

clientsRouter.get('/', getAllClients)
clientsRouter.get('/search', validateQuery(searchByPhoneSchema), searchClientByPhone) // search?phone=77071234567

clientsRouter.get('/:id', validateParams(clientParamsSchema), getClientById)
clientsRouter.get('/:id/discounts', validateParams(clientParamsSchema), getClientDiscounts)

clientsRouter.post('/', validateBody(createClientSchema), createClient)
clientsRouter.post('/:id/discounts', validateParams(clientDiscountParamsSchema), validateBody(createClientDiscountSchema), createClientDiscount)

clientsRouter.put('/:id', validateBody(updateClientSchema), updateClient)
clientsRouter.put('/:id/discounts/:serviceId', validateParams(clientDiscountParamsSchema), validateBody(updateClientDiscountSchema),updateClientDiscount)

clientsRouter.delete('/:id', validateParams(clientParamsSchema),deleteClient)
clientsRouter.delete('/:id/discounts/:serviceId', validateParams(clientDiscountParamsSchema),deleteClientDiscount)

module.exports = clientsRouter