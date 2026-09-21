import type { NextFunction, Request, Response } from 'express'
import * as serviceService from './service.service.js'
import { z } from 'zod/v4'
import type { createServiceSchema, serviceParamsSchema, UpdateServiceInput } from '../../schemas/serviceSchema.js'
import { error } from 'node:console'

type CreateServiceBody = z.infer<typeof createServiceSchema>
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

        const { name, price, duration } = req.validated?.body as CreateServiceBody
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
        if (!service) {
            res.status(404).json({ error: 'Service not found' })
            return
        }
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
        const data = req.validated.body as UpdateServiceInput
        const service = await serviceService.updateService(id, data)
        if (!service) {
            res.status(404).json({ error: 'Service not found' })
            return
        }
        res.status(200).json(service)
    } catch (error) {
        next(error)
    }
}