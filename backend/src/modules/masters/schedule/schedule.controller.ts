import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod/v4'
import * as scheduleService from './schedule.service.js'
import type { masterParamsSchema } from '../../../schemas/masterSchema.js'
import type { createScheduleSchema, scheduleParamsSchema, UpdateScheduleInput, updateScheduleParamsSchema } from '../../../schemas/scheduleSchema.js'
import { toScheduleResponse } from './schedule.mapper.js'
import { error } from 'node:console'

type MasterParams = z.infer<typeof masterParamsSchema>
type UpdateScheduleParams = z.infer<typeof updateScheduleParamsSchema>
type CreateScheduleBody = z.infer<typeof createScheduleSchema>

export const createInterval = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params || !req.validated?.body) {
            res.status(500).json({ error: 'Missing validated params or body' })
            return
        }

        const { id: master_id } = req.validated?.params as MasterParams
        const { day_of_week, starts_at, ends_at } = req.validated?.body as CreateScheduleBody
        const interval = await scheduleService.createInterval(master_id, day_of_week, starts_at, ends_at)
        res.status(201).json(toScheduleResponse(interval))
    } catch (error) {
        next(error)
    }
}

export const getIntervals = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params) {
            res.status(500).json({ error: 'Missing validated params' })
            return
        }

        const { id: master_id } = req.validated?.params as MasterParams
        const intervals = await scheduleService.findAllIntervals(master_id)
        res.status(200).json(intervals.map(toScheduleResponse))
    } catch (error) {
        next(error)
    }
}

export const updateInterval = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params || !req.validated?.body) {
            res.status(500).json({ error: 'Missing validated params or body' })
            return
        }
        const { id: master_id, intervalId } = req.validated?.params as UpdateScheduleParams
        const data = req.validated?.body as UpdateScheduleInput
        const interval = await scheduleService.updateInterval(intervalId, master_id, data)
        if (!interval) {
            res.status(404).json({ error: 'Interval not Found' })
            return
        }
        res.status(200).json(toScheduleResponse(interval))
    } catch (error) {
        next(error)
    }
}