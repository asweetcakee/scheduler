import type { RequestHandler } from 'express'
import type { ZodType } from 'zod/v4'

type ValidationSchema = {
    body?: ZodType,
    query?: ZodType,
    params?: ZodType
}

declare global {
    namespace Express {
        interface Request {
            validated?: {
                body?: unknown,
                query?: unknown,
                params?: unknown
            }
        }
    }
}

export const validate = (
    schemas: ValidationSchema
): RequestHandler => {
    return (req, res, next) => {
        try {
            req.validated = {}

            if (schemas.body) {
                req.validated.body = schemas.body.parse(req.body)
            }

            if (schemas.query) {
                req.validated.query = schemas.query.parse(req.query)
            }

            if (schemas.params) {
                req.validated.params = schemas.params.parse(req.params)
            }

            next()
        } catch (error) {
            next(error)
        }
    }
}