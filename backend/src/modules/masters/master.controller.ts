import * as masterService from './master.service.js'
import type { Request, Response, NextFunction } from 'express'
import type { z } from 'zod/v4'
import type { createMasterSchema, masterParamsSchema, updateMasterSchema } from '../../schemas/masterSchema.js'

type CreateMasterBody = z.infer<typeof createMasterSchema>
type MasterParams = z.infer<typeof masterParamsSchema>
type UpdateMasterBody = z.infer<typeof updateMasterSchema>

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

        const { name, phone, active } = req.validated.body as CreateMasterBody
        const master = await masterService.createMaster(name, phone, active)
        res.status(201).json(master)
    } catch (error) {
        next(error)
    }
}

export const getMasters = async (
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

export const getMasterById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params) {
            res.status(500).json({ error: 'Missing validated params' })
            return
        }
        const { id } = req.validated.params as MasterParams
        const master = await masterService.findMasterById(id)
        res.status(200).json(master)
    } catch (error) {
        next(error)
    }
}

export const updateMaster = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params || !req.validated?.body) {
            res.status(500).json({ error: 'Missing validated params or body' })
            return
        }
        const { id } = req.validated.params as MasterParams
        const data = req.validated.body as UpdateMasterBody
        const master = await masterService.updateMaster(id, data)
        res.status(200).json(master)
    } catch (error) {
        next(error)
    }
}

export const removeMaster = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params) {
            res.status(500).json({ error: 'Missing validated params' })
            return
        }
        const { id } = req.validated.params as MasterParams
        await masterService.removeMaster(id)
        res.status(204).send()
    } catch (error) {
        next(error)
    }
}