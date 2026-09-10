import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { pool } from '../db/pool.js'

const router = Router()
router.get(
    '/health', 
    async (
        _req: Request, 
        res: Response, 
        next: NextFunction
    ): Promise<void> => {
    try {
        await pool.query('SELECT 1')

        res.json({
            status: 'ok',
            database: 'ok'
        })
    } catch (error) {
        next(error)
    }
})

export default router