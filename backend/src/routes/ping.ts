import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'

const router = Router()
router.get(
    '/ping', 
    async (
        _req: Request, 
        res: Response, 
        next: NextFunction
    ): Promise<void> => {
    try {
        res.json({ message: 'pong' })
    } catch (error) {
        next(error)
    }
})

export default router