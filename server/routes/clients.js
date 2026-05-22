const { getAllClients, getClientById, searchClientByPhone, createClient, updateClient, deleteClient } = require('../controllers/clientsController')
const { createClientDiscount, deleteClientDiscount, updateClientDiscount, getClientDiscounts } = require('../controllers/discountsController')
const { createClientSchema, updateClientSchema } = require('../schemas/clientSchema')
const { validate } = require('../utils/middleware')

const clientsRouter = require('express').Router()

clientsRouter.get('/', getAllClients)
clientsRouter.get('/search', searchClientByPhone) // search?phone=77071234567

clientsRouter.get('/:id', getClientById)
clientsRouter.get('/:id/discounts', getClientDiscounts)

clientsRouter.post('/', validate(createClientSchema), createClient)
clientsRouter.post('/:id/discounts', createClientDiscount)

clientsRouter.put('/:id', validate(updateClientSchema), updateClient)
clientsRouter.put('/:id/discounts/:serviceId', updateClientDiscount)


clientsRouter.delete('/:id', deleteClient)
clientsRouter.delete('/:id/discounts/:serviceId', deleteClientDiscount)

module.exports = clientsRouter