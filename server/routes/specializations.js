const { getAllSpecializations, createSpecialization, updateSpecializationById, deleteSpecializationById } = require('../controllers/specializationsController')
const { specializationParamsSchema, updateSpecializationSchema, createSpecializationSchema } = require('../schemas/specializationSchema')
const { validateParams, validateBody } = require('../utils/middleware')

const specializationsRouter = require('express').Router()

specializationsRouter.get('/', getAllSpecializations)
specializationsRouter.post('/', validateBody(createSpecializationSchema), createSpecialization)
specializationsRouter.put('/:id', validateParams(specializationParamsSchema), validateBody(updateSpecializationSchema), updateSpecializationById)
specializationsRouter.delete('/:id', validateParams(specializationParamsSchema), deleteSpecializationById)

module.exports = specializationsRouter