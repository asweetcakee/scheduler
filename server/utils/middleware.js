/* 1 */
const morgan = require('morgan')
const tiny = ':method :url :status :res[content-length] - :response-time ms'

morgan.token('body', (req) => JSON.stringify(req.body))
let httpLogger = morgan(`${tiny} :body`)

/* 2 */
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

/* 3 */
const errorHandler = (err, req, res, next) => {
  console.error(err?.message)
  const msg = err.message ?? ''

  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || msg.includes('UNIQUE constraint failed')) {
    return res.status(409).json({ error: 'Duplicate entry, record already exists' })
  }

  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' || msg.includes('FOREIGN KEY constraint failed')){
    return res.status(409).json({ error: 'Referenced record does not exist' })
  }

  if (err.code === 'SQLITE_CONSTRAINT_NOTNULL' || msg.includes('NOT NULL constraint failed')){
    return res.status(400).json({ error: 'A required field is missing' })
  }

  if (err.code === 'SQLITE_CONSTRAINT_CHECK' || msg.includes('CHECK constraint failed')) {
    if (msg.includes('endTime > startTime'))
      return res.status(400).json({ error: 'End time must be later than start time' })
    if (msg.includes('actualRevenue >= 0'))
      return res.status(400).json({ error: 'Actual revenue must be 0 or greater' })
    if (msg.includes('isConfirmed IN'))
      return res.status(400).json({ error: 'isConfirmed must be 1 or 0' })
    if (msg.includes('status IN'))
      return res.status(400).json({ error: 'Status must be \'scheduled\', \'completed\', or \'cancelled\'' })
    if (msg.includes('discountPercent'))
      return res.status(400).json({ error: 'Discount must be between 0 and 100' })

    return res.status(400).json({ error: 'A field value failed a constraint check' })
  }

  // Thrown errors
  if(msg === 'NOT_FOUND') {
    return res.status(404).json({ error: 'Record not found' })
  }
  if (msg === 'TOTAL_MISMATCH' || msg === 'INCORRECT_SERVICE_PRICE') {
    return res.status(400).json({ error: "Frontend calculation doesn't match backend" })
  }

  // SQLite availability
  if (err.code === 'SQLITE_BUSY' || err.code === 'SQLITE_LOCKED')
    return res.status(503).json({ error: 'Database is busy, please retry' })
  if (err.code === 'SQLITE_CORRUPT' || err.code === 'SQLITE_CANTOPEN')
    return res.status(500).json({ error: 'Database unavailable' })

  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Something went wrong' })
}

module.exports = { httpLogger, unknownEndpoint, errorHandler }