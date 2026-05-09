const { getAllClients, getClientById, searchClientByPhone, createClient, updateClient, deleteClient } = require('../controllers/clientsController')

const clientsRouter = require('express').Router()

clientsRouter.get('/', getAllClients)
clientsRouter.get('/search', searchClientByPhone)
clientsRouter.get('/:id', getClientById)
clientsRouter.post('/', createClient)
clientsRouter.put('/:id', updateClient)
clientsRouter.delete('/:id', deleteClient)

module.exports = clientsRouter