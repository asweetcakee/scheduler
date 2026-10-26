import type { NextFunction, Request, Response } from 'express'
import type { CalendarQuery } from '../../schemas/calendarSchema.js'
import * as calendarService from './calendar.service.js'

export const getCalendar = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.query) {
            res.status(500).json({ error: 'Missing validated query' })
            return
        }

        const { date } = req.validated.query as CalendarQuery
        const calendar = await calendarService.getCalendar(date)
        res.status(200).json(calendar)
    } catch (error) {
        next(error)
    }
}