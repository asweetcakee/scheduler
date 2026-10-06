import type { NextFunction, Request, Response } from 'express'
import * as serviceService from './service.service.js'
import type { z } from 'zod/v4'
import type { createServiceSchema, serviceParamsSchema, updateServiceSchema } from '../../schemas/serviceSchema.js'

type CreateServiceBody = z.infer<typeof createServiceSchema>
type UpdateServiceBody = z.infer<typeof updateServiceSchema>
type ServiceParams = z.infer<typeof serviceParamsSchema>

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

        const { name, price, duration } = req.validated.body as CreateServiceBody
        const service = await serviceService.createService(name, price, duration)
        res.status(201).json(service)
    } catch (error) {
        next(error)
    }
}

export const getServices = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const services = await serviceService.findAllServices()
        res.status(200).json(services)
    } catch (error) {
        next(error)
    }
}

export const getServiceById = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params) {
            res.status(500).json({ error: 'Missing validated params' })
            return
        }
        const { id } = req.validated.params as ServiceParams
        const service = await serviceService.findServiceById(id)
        res.status(200).json(service)
    } catch (error) {
        next(error)
    }
}

export const updateService = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params || !req.validated?.body) {
            res.status(500).json({ error: 'Missing validated params or body' })
            return
        }
        const { id } = req.validated.params as ServiceParams
        const data = req.validated.body as UpdateServiceBody
        const service = await serviceService.updateService(id, data)
        res.status(200).json(service)
    } catch (error) {
        next(error)
    }
}

export const removeService = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params) {
            res.status(500).json({ error: 'Missing validated params' })
            return
        }
        const { id } = req.validated.params as ServiceParams
        await serviceService.removeService(id)
        res.status(204).send()
    } catch (error) {
        next(error)
    }
}