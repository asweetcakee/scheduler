import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod/v4'
import * as scheduleService from './schedule.service.js'
import type { masterParamsSchema } from '../../../schemas/masterSchema.js'
import type { createScheduleSchema } from '../../../schemas/scheduleSchema.js'

type MasterParams = z.infer<typeof masterParamsSchema>
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
        res.status(201).json({
            id: Number(interval.id),
            day_of_week: interval.day_of_week,
            starts_at: interval.starts_at.slice(0, 5),
            ends_at: interval.ends_at.slice(0, 5)
        })
    } catch (error) {
        next(error)
    }
}