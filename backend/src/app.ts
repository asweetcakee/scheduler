import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'

import { openApiDocument } from './config/openapi.js'
import { httpLogger } from './middlewares/logger.js'
import healthRouter from './routes/health.js'
import pingRouter from './routes/ping.js'
import clientRouter from './routes/clients.js'
import { notFound } from './middlewares/notFound.js'
import { errorHandler } from './middlewares/errorHandler.js'

const app = express()

app.use(express.json())
app.use(cors())
app.use(httpLogger)

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))
app.use('/api', pingRouter)
app.use('/api', healthRouter)
app.use('/api/clients', clientRouter)

app.use(notFound)
app.use(errorHandler)

export default app