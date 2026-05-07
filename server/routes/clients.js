const { getAllClients, getClientById } = require('../controllers/clients')

const clientsRouter = require('express').Router()

clientsRouter.get('/', getAllClients)
clientsRouter.get('/:id', getClientById)

module.exports = clientsRouter