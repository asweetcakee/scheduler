import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod/v4'
import { ConflictError } from '../errors/ConflictError.js'
import { UnprocessableEntityError } from '../errors/UnprocessableEntityError.js'

export const errorHandler = (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) : void => {
    console.error(error)

    if (error instanceof ZodError) {
        res.status(400).json({
            error: 'Invalid request',
            details: error.issues
        })
        return
    }

    if (error instanceof ConflictError) {
        res.status(409).json({
            error: error.message
        })
        return
    }

    if (error instanceof UnprocessableEntityError) {
        res.status(422).json({
            error: error.message
        })
        return
    }

    res.status(500).json({
        error: 'Internal server error'
    })
}