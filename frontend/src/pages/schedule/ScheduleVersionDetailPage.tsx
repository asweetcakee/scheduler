import { Navigate, useParams } from 'react-router-dom'
import { useToday } from '../../hooks/useToday'
import { useVersionById, useVersions } from '../../hooks/schedule'
import { classifyVersions } from '../../utils/scheduleVersions'
import { Badge } from '../../components/shared/Badge'
import { InfoItem } from '../../components/masters/schedule/InfoItem'
import { dayBefore } from '../../hooks/helper'
import { WeekSchedule } from '../../components/masters/schedule/WeekSchedule'

export const ScheduleVersionDetailPage = () => {
    const { masterId, versionId } = useParams()
    const masterIdNum = Number(masterId)
    const versionIdNum = Number(versionId)
    const today = useToday()

    const { data: versions, isLoading: isVersionsLoading, error: versionsError } = useVersions(masterIdNum)

    const { sorted, current } = classifyVersions(versions ?? [], today)
    const index = sorted.findIndex(v => v.id === versionIdNum)
    const version = sorted[index]
    const previous = sorted[index - 1]
    const following = sorted[index + 1]

    const needsDetails = Boolean(version) && version?.status !== 'current'
    const { data: schedule, isLoading: isScheduleLoading, error: scheduleError } = useVersionById(masterIdNum, versionIdNum, needsDetails)

    if (isScheduleLoading || isVersionsLoading) return <p className='m-6'>Загрузка...</p>
    if (scheduleError || versionsError) return <p className='m-6'>Ошибка: {(scheduleError ?? versionsError)?.message}</p>
    if (!version) return <p className='m-6'>Версия не найдена</p>
    if (version.status === 'current') return <Navigate to={`/schedule/${masterIdNum}`} replace />
    if (!schedule) return null

    return (
        <section className='flex flex-col gap-2'>
            <div className='flex flex-wrap items-start justify-between gap-2 pb-4 border-b border-dashed border-border/50'>
                <div className='flex flex-col gap-2'>
                    {version.status === 'historical' && (
                        <>
                            <div className='flex gap-2'>
                                <span className='text-lg font-bold text-text-data'>Версия:</span>
                                <Badge variant='info' text={`v${version.number}`} sizes='px-2 py-1' />
                            </div>
                            <div className='flex gap-2'>
                                <InfoItem label='Действовала с' date={version.effective_from}/>
                                {following && <InfoItem label='по' date={dayBefore(following.effective_from)}/>}
                            </div>
                        </>
                    )}
                    {version.status === 'future' && (
                        <>
                            <div className='flex gap-2'>
                                <span className='text-sm text-text-secondary'>Дата вступления новой</span>
                                <input type='date' defaultValue={version.effective_from} />
                            </div>
                            {current && <InfoItem label='Сейчас действует' date={current.effective_from} />}
                            {previous && previous.id !== current?.id && <InfoItem label='Предыдущая версия' date={previous.effective_from} />}
                            {following && <InfoItem label='Следующая версия' date={following.effective_from} />}
                        </>
                    )}
                </div>
            </div>
            {version.status === 'historical' && <WeekSchedule intervals={schedule.intervals} />}
            {version.status === 'future' && (
                <p>temporary</p>
            )}
        </section>
    )
}