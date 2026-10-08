import type { ISODate } from '../../../schemas/scheduleSchema'
import type { ScheduleVersionResponse } from '../../../types/schedule'
import { classifyVersions } from '../../../utils/scheduleVersions'
import { formatDate } from '../../../hooks/helper'
import { Badge } from '../../shared/Badge'

const InfoItem = ({ label, date }: { label: string, date: ISODate }) => {
    return(
        <div className='flex items-center gap-2 text-sm'>
            <span className='text-text-secondary'>{label}</span>
            <span className='font-semibold text-text-data'>{formatDate(date)}</span>
        </div>
    )
}

type VersionSummaryProps = {
    versions: ScheduleVersionResponse[]
    today: ISODate
}

export const VersionSummary = ({ versions, today }: VersionSummaryProps) => {
    const { current, next } = classifyVersions(versions, today)

    return(
        <div className='flex flex-col gap-2'>
            {current && (
                <>
                    <div className='flex gap-2'>
                        <span className='text-lg font-bold text-text-data'>Версия:</span>
                        <Badge variant='info' text={`v${current.number}`} sizes='px-2 py-1'/>
                    </div>
                    <InfoItem label='Действует с' date={current.effective_from}/>
                    {next && <InfoItem label='Следующая версия с' date={next.effective_from} />}
                </>
            )}
            {!current && next && (
                <>  
                    <div className='flex gap-2'>
                        <span className='text-lg font-bold text-text-data'>Версия:</span>
                        <Badge variant='danger' text='Ещё не действует' sizes='px-2 py-1'/>
                    </div>
                    <InfoItem label='Вступит с' date={next.effective_from} />
                </>
            )}
            {!current && !next && (
                <Badge variant='danger' text='Расписание не задано' sizes='px-2 py-1'/>
            )}
        </div>
    )
}