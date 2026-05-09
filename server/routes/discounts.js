const { getAllDiscounts, getClientDiscounts, createClientDiscount, updateClientDiscountById, deleteClientDiscount } = require('../controllers/discountsController')

const discountsRouter = require('express').Router()

discountsRouter.get('/', getAllDiscounts)
discountsRouter.get('/client/:id', getClientDiscounts)
discountsRouter.post('/', createClientDiscount)
discountsRouter.patch('/:id', updateClientDiscountById)
discountsRouter.delete('/:id', deleteClientDiscount)

module.exports = discountsRouter
