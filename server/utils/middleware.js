/* 1 */
const morgan = require('morgan')
const tiny = ':method :url :status :res[content-length] - :response-time ms'

morgan.token('body', (req) => JSON.stringify(req.body))
let httpLogger = morgan(`${tiny} :body`)

/* 2 */
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

module.exports = { httpLogger, unknownEndpoint }