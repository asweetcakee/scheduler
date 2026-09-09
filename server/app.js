const express = require('express')
const app = express()

const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger-output.json')

const middleware = require('./utils/middleware')

const servicesRouter = require('./routes/services')
const clientsRouter = require('./routes/clients')
const discountsRouter = require('./routes/discounts')
const specializationsRouter = require('./routes/specializations')
const staffRouter = require('./routes/staff')
const appointmentsRouter = require('./routes/appointments')

app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))
app.use(middleware.httpLogger)

app.use('/api/services', servicesRouter)
app.use('/api/clients', clientsRouter)
app.use('/api/discounts', discountsRouter)
app.use('/api/specializations', specializationsRouter)
app.use('/api/staff', staffRouter)
app.use('/api/appointments', appointmentsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app