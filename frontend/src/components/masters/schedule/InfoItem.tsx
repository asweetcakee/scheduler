import { formatDate } from '../../../hooks/helper'
import type { ISODate } from '../../../schemas/scheduleSchema'

export const InfoItem = ({ label, date }: { label: string, date: ISODate }) => {
    return(
        <div className='flex items-center gap-2 text-sm'>
            <span className='text-text-secondary'>{label}</span>
            <span className='font-semibold text-text-data'>{formatDate(date)}</span>
        </div>
    )
}