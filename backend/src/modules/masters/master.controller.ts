import * as masterService from './master.service.js'
import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod/v4'
import type { createMasterSchema, masterParamsSchema } from '../../schemas/masterSchema.js'
import type { updateClientSchema } from '../../schemas/clientSchema.js'
import { error } from 'node:console'

type CreateMasterBody = z.infer<typeof createMasterSchema>
type MasterParams = z.infer<typeof masterParamsSchema>
type UpdateMasterBody = z.infer<typeof updateClientSchema>

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
        if (!master) {
            res.status(404).json({
                error: 'Master not found'
            })
            return
        }
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
        if (!master) {
            res.status(404).json({
                error: 'Master not found'
            })
            return
        }
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
        const result = await masterService.removeMaster(id)
        if (!result) {
            res.status(404).json({
                error: 'Client not found'
            })
            return
        }
        res.status(204).send()
    } catch (error) {
        next(error)
    }
}