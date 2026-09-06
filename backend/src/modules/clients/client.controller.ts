import * as clientService from './client.service.js'
import type { Request, Response, NextFunction } from 'express'
import { clientParamsSchema } from '../../schemas/clientSchema.js'
import type { z } from 'zod/v4'

type ClientParams = z.infer<typeof clientParamsSchema> // guarantees 'id' is type of 'number'

export const getClientById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params) {
            res.status(500).json({ error: 'Missing validated params' })
            return
        }

        const { id } = req.validated.params as ClientParams
        const client = await clientService.findClientById(id)
        if (!client) {
            res.status(404).json({
                error: 'Client not found'
            })
            return
        }
        res.status(200).json(client)
    } catch (error) {
        next(error)
    }
}