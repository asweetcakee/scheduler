import * as clientService from './client.service.js'
import type { Request, Response, NextFunction } from 'express'
import { clientParamsSchema, createClientSchema } from '../../schemas/clientSchema.js'
import type { z } from 'zod/v4'

type ClientParams = z.infer<typeof clientParamsSchema> // guarantees 'id' is type of 'number'
type CreateClientBody = z.infer<typeof createClientSchema>

export const createClient = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.body) {
            res.status(500).json({ error: 'Missing validated body' })
            return
        }

        const { name, phone, note } = req.validated.body as CreateClientBody
        const client = await clientService.createClient(name, phone, note ?? null)
        res.status(201).json(client)
    } catch (error) {
        next(error)
    }
}

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