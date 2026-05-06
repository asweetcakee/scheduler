const middleware = require('./utils/middleware')

const express = require('express')

const app = express()

app.use(express.json())
app.use(middleware.httpLogger)

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong', time: new Date().toISOString() })
})

app.use(middleware.unknownEndpoint)

module.exports = app