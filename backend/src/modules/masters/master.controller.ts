import * as masterService from './master.service.js'
import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod/v4'
import type { createMasterSchema } from '../../schemas/masterSchema.js'

type CreateMasterBody = z.infer<typeof createMasterSchema>

export const createMaster = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.body) {
            res.status(500).json({ error: 'Missing validated body' })
            return
        }

        const { name, phone, active } = req.validated?.body as CreateMasterBody
        const master = await masterService.createMaster(name, phone, active)
        res.status(201).json(master)
    } catch (error) {
        next(error)
    }
}

export const getMaster = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const masters = await masterService.findAllMasters()
        res.status(200).json(masters)
    } catch (error) {
        next(error)
    }
}