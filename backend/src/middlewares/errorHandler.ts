import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod/v4'

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

    res.status(500).json({
        error: 'Internal server error'
    })
}