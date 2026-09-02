import type { Request, Response, NextFunction } from 'express'

export const errorHandler = (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) : void => {
    console.error(error)

    res.status(500).json({
        error: 'Internal server error'
    })
}