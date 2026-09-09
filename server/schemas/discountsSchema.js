const { z } = require('zod/v4')
const { idParam, serviceIdParam, discountPercentField } = require('./shared')

const clientDiscountParamsSchema = z.object({
  id: idParam,
  serviceId: serviceIdParam
})

const createClientDiscountSchema = z.object({
  serviceId: serviceIdParam,
  discountPercent: discountPercentField
})

const updateClientDiscountSchema = z.object({
  discountPercent: discountPercentField
})

module.exports = {
  clientDiscountParamsSchema,
  createClientDiscountSchema,
  updateClientDiscountSchema
}