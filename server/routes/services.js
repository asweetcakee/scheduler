const { getAllServices, getServiceById, createService, updateService, deleteService } = require('../controllers/servicesController')
const { createServiceSchema, updateServiceSchema } = require('../schemas/serviceSchema')

const servicesRouter = require('express').Router()

servicesRouter.get('/', getAllServices)
servicesRouter.get('/:id', getServiceById)
servicesRouter.post('/', validate(createServiceSchema), createService)
servicesRouter.put('/:id', validate(updateServiceSchema), updateService)
servicesRouter.delete('/:id', deleteService)

module.exports = servicesRouter