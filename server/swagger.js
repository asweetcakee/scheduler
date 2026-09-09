const swaggerAutogen = require('swagger-autogen')()
const config = require('./utils/config')

const doc = {
  info: {
    title: 'My API',
    description: 'Документация моего API',
  },
  host: config.HOST
}

const outputFile = './swagger-output.json'
const routes = ['./app.js']

swaggerAutogen(outputFile, routes, doc)