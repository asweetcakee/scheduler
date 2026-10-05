import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod/v4'
import * as scheduleService from './schedule.service.js'
import type { masterParamsSchema } from '../../../schemas/masterSchema.js'
import type { createVersionSchema, versionParamsSchema, scheduleQuerySchema, updateVersionSchema } from '../../../schemas/scheduleSchema.js'

type MasterParams = z.infer<typeof masterParamsSchema>
type ScheduleQuery = z.infer<typeof scheduleQuerySchema>
type ScheduleParams = z.infer<typeof versionParamsSchema>
type UpdateVersionBody = z.infer<typeof updateVersionSchema>
type CreateVersionBody = z.infer<typeof createVersionSchema>

export const createVersionForMaster = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params || !req.validated?.body) {
            res.status(500).json({ error: 'Missing validated params or body' })
            return
        }

        const { id } = req.validated?.params as MasterParams
        const { effective_from, intervals } = req.validated?.body as CreateVersionBody
        const schedule = await scheduleService.createVersionForMaster(id, effective_from, intervals)
        res.status(201).json(schedule)
    } catch (error) {
        next(error)
    }
}

export const getScheduleForDate = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params || !req.validated?.query) {
            res.status(500).json({ error: 'Missing validated params or query' })
            return
        }

        const { id } = req.validated.params as MasterParams
        const { date } = req.validated.query as ScheduleQuery
        const schedule = await scheduleService.findScheduleForDate(id, date)
        res.status(200).json(schedule)
    } catch (error) {
        next(error)
    }
}

export const getVersionsForMaster = async(
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
        const schedules = await scheduleService.findVersionsForMaster(id)
        res.status(200).json(schedules)
    } catch (error) {
        next(error)
    }
}

export const getScheduleByVersionId = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params) {
            res.status(500).json({ error: 'Missing validated params' })
            return
        }

        const { id, versionId } = req.validated.params as ScheduleParams
        const schedules = await scheduleService.findScheduleByVersionId(id, versionId)
        res.status(200).json(schedules)
    } catch (error) {
        next(error)
    }
}

export const updateVersionForMaster = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params || !req.validated?.body) {
            res.status(500).json({ error: 'Missing validated params or body' })
            return
        }

        const { id, versionId } = req.validated.params as ScheduleParams
        const { effective_from, intervals } = req.validated?.body as UpdateVersionBody
        const schedule = await scheduleService.updateVersionForMaster(id, versionId, effective_from, intervals)
        res.status(200).json(schedule)
    } catch (error) {
        next(error)
    }
}

export const removeVersionForMaster = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params) {
            res.status(500).json({ error: 'Missing validated params' })
            return
        }
        const { id, versionId } = req.validated.params as ScheduleParams
        await scheduleService.removeVersionForMaster(id, versionId)
        res.status(204).send()
    } catch (error) {
        next(error)
    }
}