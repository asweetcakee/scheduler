const { z } = require('zod/v4')
const { idParamsSchema, nameField } = require('./shared')

const specializationParamsSchema = idParamsSchema

const createSpecializationSchema = z.object({ name: nameField })
const updateSpecializationSchema = z.object({ name: nameField })

module.exports = { specializationParamsSchema, createSpecializationSchema, updateSpecializationSchema }