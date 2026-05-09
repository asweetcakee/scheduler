const { getAllSpecializations, createSpecialization, updateSpecializationById, deleteSpecializationById } = require('../controllers/specializationsController')

const specializationsRouter = require('express').Router()

specializationsRouter.get('/', getAllSpecializations)
specializationsRouter.post('/', createSpecialization)
specializationsRouter.put('/:id', updateSpecializationById)
specializationsRouter.delete('/:id', deleteSpecializationById)

module.exports = specializationsRouter