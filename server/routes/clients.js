const { getAllClients, getClientById, searchClientByPhone, createClient, updateClient, deleteClient } = require('../controllers/clientsController')
const { createClientDiscount, deleteClientDiscount, updateClientDiscount, getClientDiscounts } = require('../controllers/discountsController')

const clientsRouter = require('express').Router()

clientsRouter.get('/', getAllClients)
clientsRouter.get('/search', searchClientByPhone)

clientsRouter.get('/:id', getClientById)
clientsRouter.get('/:id/discounts', getClientDiscounts)

clientsRouter.post('/', createClient)
clientsRouter.post('/:id/discounts', createClientDiscount)

clientsRouter.put('/:id', updateClient)
clientsRouter.put('/:id/discounts/:serviceId', updateClientDiscount)


clientsRouter.delete('/:id', deleteClient)
clientsRouter.delete('/:id/discounts/:serviceId', deleteClientDiscount)

module.exports = clientsRouter