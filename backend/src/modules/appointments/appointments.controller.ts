import type { NextFunction, Request, Response } from 'express'
import type { CreateAppointmentBody } from '../../schemas/appointmentSchema.js'
import * as appointmentService from './appointments.service.js'

export const createAppointment = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.body) {
            res.status(500).json({ error: 'Missing validated body' })
            return
        }

        const data = req.validated.body as CreateAppointmentBody
        const appointment = await appointmentService.createAppointment(data)
        res.status(201).json(appointment)
    } catch (error) {
        next(error)
    }
}