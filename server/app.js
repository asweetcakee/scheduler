const express = require('express')
const app = express()

const middleware = require('./utils/middleware')

const servicesRouter = require('./routes/services')
const clientsRouter = require('./routes/clients')
const discountsRouter = require('./routes/discounts')
const appointmentsRouter = require('./routes/appointments')
const staffRouter = require('./routes/staff')
const specializationsRouter = require('./routes/specializations')

app.use(express.json())
app.use(middleware.httpLogger)

app.use('/api/services', servicesRouter)
app.use('/api/clients', clientsRouter)
app.use('/api/discounts', discountsRouter)
app.use('/api/specializations', specializationsRouter)
app.use('/api/staff', staffRouter)
app.use('/api/appointments', appointmentsRouter)

app.use(middleware.unknownEndpoint)

module.exports = app