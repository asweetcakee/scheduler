import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod/v4'
import * as scheduleService from './schedule.service.js'
import type { masterParamsSchema } from '../../../schemas/masterSchema.js'
import type { createIntervalSchema, DeleteIntervalParams, scheduleQuerySchema, UpdateIntervalInput, updateIntervalParamsSchema } from '../../../schemas/scheduleSchema.js'
import { toIntervalResponse } from './schedule.mapper.js'

type MasterParams = z.infer<typeof masterParamsSchema>
type ScheduleQuery = z.infer<typeof scheduleQuerySchema>
type UpdateScheduleParams = z.infer<typeof updateIntervalParamsSchema>
type CreateScheduleBody = z.infer<typeof createIntervalSchema>

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
        res.status(201).json(toIntervalResponse(interval))
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
        const data = req.validated?.body as UpdateIntervalInput
        const interval = await scheduleService.updateInterval(intervalId, master_id, data)
        if (!interval) {
            res.status(404).json({ error: 'Interval not Found' })
            return
        }
        res.status(200).json(toIntervalResponse(interval))
    } catch (error) {
        next(error)
    }
}

export const removeInterval = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params) {
            res.status(500).json({ error: 'Missing validated params' })
            return
        }
        const { id: master_id, intervalId } = req.validated?.params as DeleteIntervalParams
        const interval = await scheduleService.removeInterval(intervalId, master_id)
        if (!interval) {
            res.status(404).json({ error: 'Interval not Found' })
            return
        }
        res.status(204).send()
    } catch (error) {
        next(error)
    }
}