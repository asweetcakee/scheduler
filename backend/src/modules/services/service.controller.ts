import type { NextFunction, Request, Response } from 'express'
import * as serviceService from './service.service.js'
import { z } from 'zod/v4'
import type { createServiceSchema } from '../../schemas/serviceSchema.js'

type CreateServiceBody = z.infer<typeof createServiceSchema>

export const createService = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.body) {
            res.status(500).json({ error: 'Missing validated body' })
            return
        }

        const { name, price, duration } = req.validated?.body as CreateServiceBody
        const service = await serviceService.createService(name, price, duration)
        res.status(201).json(service)
    } catch (error) {
        next(error)
    }
}