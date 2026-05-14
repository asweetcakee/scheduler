// TODO: remove this API in production. DEV ONLY
const { getAllDiscounts } = require('../controllers/discountsController')

const discountsRouter = require('express').Router()

discountsRouter.get('/', getAllDiscounts)

module.exports = discountsRouter