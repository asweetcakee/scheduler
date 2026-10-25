import type { NextFunction, Request, Response } from 'express'
import type { AppointmentParams, AppointmentBody, ChangeStatusBody } from '../../schemas/appointmentSchema.js'
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

        const data = req.validated.body as AppointmentBody
        const appointment = await appointmentService.createAppointment(data)
        res.status(201).json(appointment)
    } catch (error) {
        next(error)
    }
}

export const getAppointmentById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params) {
            res.status(500).json({ error: 'Missing validated params' })
            return
        }

        const { id } = req.validated.params as AppointmentParams
        const appointment = await appointmentService.findAppointment(id)
        res.status(200).json(appointment)
    } catch (error) {
        next(error)
    }
}

export const updateAppointment = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params || !req.validated?.body) {
            res.status(500).json({ error: 'Missing validated params or body' })
            return
        }

        const { id } = req.validated.params as AppointmentParams
        const data = req.validated.body as AppointmentBody
        const appointment = await appointmentService.updateAppointment(id, data)
        res.status(200).json(appointment)
    } catch (error) {
        next(error)
    }
}

export const changeAppointmentStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.validated?.params || !req.validated?.body) {
            res.status(500).json({ error: 'Missing validated params or body' })
            return
        }

        const { id } = req.validated.params as AppointmentParams
        const { status } = req.validated.body as ChangeStatusBody
        const appointment = await appointmentService.changeAppointmentStatus(id, status)
        res.status(200).json(appointment)
    } catch (error) {
        next(error)
    }
}