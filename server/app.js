const servicesRouter = require('./routes/services')
const clientsRouter = require('./routes/clients')
const appointmentsRouter = require('./routes/appointments')
const middleware = require('./utils/middleware')

const express = require('express')

const app = express()

app.use(express.json())
app.use(middleware.httpLogger)

app.use('/api/services', servicesRouter)
app.use('/api/clients', clientsRouter)
app.use('/api/appointments', appointmentsRouter)

app.use(middleware.unknownEndpoint)

module.exports = app