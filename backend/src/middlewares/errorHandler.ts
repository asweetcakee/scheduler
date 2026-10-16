import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod/v4'
import { ConflictError } from '../errors/ConflictError.js'
import { UnprocessableEntityError } from '../errors/UnprocessableEntityError.js'
import { NotFoundError } from '../errors/NotFoundError.js'
import { isBodyParseError } from '../errors/isBodyParseError.js'

export const errorHandler = (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) : void => {
    if (isBodyParseError(error)) {
        res.status(400).json({ error: 'Invalid JSON body' })
        return
    }

    if (error instanceof ZodError) {
        res.status(400).json({
            error: 'Invalid request',
            details: error.issues
        })
        return
    }

    if (error instanceof NotFoundError) {
        res.status(404).json({
            error: error.message
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

    console.error(error)
    res.status(500).json({
        error: 'Internal server error'
    })
}