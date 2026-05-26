const { getAllServices, getServiceById, createService, updateService, deleteService } = require('../controllers/servicesController')
const { createServiceSchema, updateServiceSchema, serviceParamsSchema } = require('../schemas/serviceSchema')
const { validateBody, validateParams } = require('../utils/middleware')

const servicesRouter = require('express').Router()

servicesRouter.get('/', getAllServices)
servicesRouter.get('/:id', validateParams(serviceParamsSchema), getServiceById)
servicesRouter.post('/', validateBody(createServiceSchema), createService)
servicesRouter.put('/:id', validateBody(updateServiceSchema), updateService)
servicesRouter.delete('/:id', validateParams(serviceParamsSchema), deleteService)

module.exports = servicesRouter