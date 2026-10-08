import { useEffect, useState } from 'react'
import { getToday } from './helper'
import type { ISODate } from '../schemas/scheduleSchema'

export const useToday = () => {
    const [today, setToday] = useState<ISODate>(getToday)

    useEffect(() => {
        const update = () => setToday(getToday())

        const timer = setInterval(update, 60_000)
        document.addEventListener('visibilitychange', update)

        return () => {
            clearInterval(timer)
            document.removeEventListener('visibilitychange', update)
        }
    }, [])

    return today
}