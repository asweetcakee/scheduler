const { getAllServices, getServiceById, createService, updateService, deleteService } = require('../controllers/services')

const servicesRouter = require('express').Router()

servicesRouter.get('/', getAllServices)
servicesRouter.get('/:id', getServiceById)
servicesRouter.post('/', createService)
servicesRouter.put('/:id', updateService)
servicesRouter.delete('/:id', deleteService)

module.exports = servicesRouter