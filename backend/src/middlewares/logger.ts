import morgan from 'morgan'
import type { Request } from 'express'

const tiny = ':method :url :status :res[content-length] - :response-time ms'

morgan.token('body', (req: Request) => JSON.stringify(req.body))
export const httpLogger = morgan(`${tiny} :body`)