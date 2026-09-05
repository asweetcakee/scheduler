import * as clientService from './client.service.js'
import type { Request, Response, NextFunction } from 'express'

export const getClientById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = Number(req.params.id)
        const client = await clientService.findClientById(id)
        res.status(200).json(client)
    } catch (error) {
        next(error)
    }
}