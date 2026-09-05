import type { RequestHandler } from 'express'
import type { ZodType } from 'zod/v4'

type ValidationSchema = {
    body?: ZodType,
    query?: ZodType,
    params?: ZodType
}

export const validate = (
    schemas: ValidationSchema
): RequestHandler => {
    return (req, res, next) => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body)
            }

            if (schemas.query) {
                schemas.query.parse(req.query)
            }

            if (schemas.params) {
                schemas.params.parse(req.params)
            }

            next()
        } catch (error) {
            next(error)
        }
    }
}