import express from 'express'
import cors from 'cors'

import { httpLogger } from './middlewares/logger.js'
import healthRouter from './routes/health.js'
import pingRouter from './routes/ping.js'
import { notFound } from './middlewares/notFound.js'
import { errorHandler } from './middlewares/errorHandler.js'

const app = express()

app.use(express.json())
app.use(cors())
app.use(httpLogger)

app.use('/api', pingRouter)
app.use('/api', healthRouter)

app.use(notFound)
app.use(errorHandler)

export default app