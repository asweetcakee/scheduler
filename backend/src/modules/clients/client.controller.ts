import * as clientService from './client.service.js'
import type { Request, Response, NextFunction } from 'express'
import { clientParamsSchema, clientPhoneQuerySchema, createClientSchema, updateClientSchema } from '../../schemas/clientSchema.js'
import type { z } from 'zod/v4'

type ClientParams = z.infer<typeof clientParamsSchema> // guarantees 'id' is type of 'number'
type CreateClientBody = z.infer<typeof createClientSchema>
type ClientQuery = z.infer<typeof clientPhoneQuerySchema>
type UpdateClientBody = z.infer<typeof updateClientSchema>

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
        res.status(200).json(client)
    } catch (error) {
        next(error)
    }
}

export const getClients = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.query) {
            res.status(500).json({ error: 'Missing validated query' })
            return
        }

        const { phone } = req.validated.query as ClientQuery
        if (phone) {
            const client = await clientService.findClientByPhone(phone)
            res.status(200).json(client ? [client] : [])
            return
        }

        const clients = await clientService.findAllClients()
        res.status(200).json(clients)
    } catch (error) {
        next(error)
    }
}

export const updateClient = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params || !req.validated?.body) {
            res.status(500).json({ error: 'Missing validated params or body' })
            return
        }

        const { id } = req.validated.params as ClientParams
        const data = req.validated.body as UpdateClientBody
        const client = await clientService.updateClient(id, data)
        res.status(200).json(client)
    } catch (error) {
        next(error)
    }
}

export const removeClient = async(
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
        await clientService.removeClient(id)
        res.status(204).send()
    } catch (error) {
        next(error)
    }
}