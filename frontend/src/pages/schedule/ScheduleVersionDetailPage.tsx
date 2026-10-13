import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useToday } from '../../hooks/useToday'
import { useUpdateVersion, useVersionById, useVersions } from '../../hooks/schedule'
import { classifyVersions } from '../../utils/scheduleVersions'
import { Badge } from '../../components/shared/Badge'
import { InfoItem } from '../../components/masters/schedule/InfoItem'
import { dayBefore } from '../../hooks/helper'
import { WeekSchedule } from '../../components/masters/schedule/WeekSchedule'
import { VersionEditor } from '../../components/masters/schedule/VersionEditor'
import type { UpdateVersionBody } from '../../types/schedule'

export const ScheduleVersionDetailPage = () => {
    const { masterId, versionId } = useParams()
    const masterIdNum = Number(masterId)
    const versionIdNum = Number(versionId)
    const today = useToday()
    const navigate = useNavigate()

    const { data: versions, isLoading: isVersionsLoading, error: versionsError } = useVersions(masterIdNum)

    const { sorted, current } = classifyVersions(versions ?? [], today)
    const index = sorted.findIndex(v => v.id === versionIdNum)
    const version = sorted[index]
    const previous = sorted[index - 1]
    const following = sorted[index + 1]

    const needsDetails = Boolean(version) && version?.status !== 'current'
    const { data: schedule, isLoading: isScheduleLoading, error: scheduleError } = useVersionById(masterIdNum, versionIdNum, needsDetails)

    const updateMutation = useUpdateVersion(masterIdNum, versionIdNum)

    if (isScheduleLoading || isVersionsLoading) return <p className='m-6'>Загрузка...</p>
    if (scheduleError || versionsError) return <p className='m-6'>Ошибка: {(scheduleError ?? versionsError)?.message}</p>
    if (!version) return <p className='m-6'>Версия не найдена</p>
    if (version.status === 'current') return <Navigate to={`/schedule/${masterIdNum}`} replace />
    if (!schedule) return null

    const takenDates = sorted
        .filter(version => version.id !== versionIdNum)
        .map(version => version.effective_from)

    const scheduleBody: UpdateVersionBody = {
        effective_from: schedule.version.effective_from,
        intervals: schedule.intervals.map(interval => ({
            day_of_week: interval.day_of_week, 
            starts_at: interval.starts_at, 
            ends_at: interval.ends_at
        }))
    }

    const onSubmit = (data: UpdateVersionBody) => {
        updateMutation.mutate(
            data, 
            { onSuccess: () => navigate(`/schedule/${masterIdNum}`) }
        )
    }

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
                                <span className='text-lg font-bold text-text-data'>Версия:</span>
                                <Badge variant='info' text='Будущая' sizes='px-2 py-1'/>
                                <Badge variant='danger' text='редактирование' sizes='px-2 py-1'/>
                            </div>
                            {current && <InfoItem label='Сейчас действует' date={current.effective_from} />}
                            {previous && previous.id !== current?.id && <InfoItem label='Предыдущая версия' date={previous.effective_from} />}
                            {following && <InfoItem label='Следующая версия' date={following.effective_from} />}
                        </>
                    )}
                </div>
            </div>
            {version.status === 'historical' && <WeekSchedule intervals={schedule.intervals} />}
            {version.status === 'future' && 
                <VersionEditor
                    key={versionIdNum}
                    initial={scheduleBody}
                    takenDates={takenDates}
                    today={today}
                    isSubmitting={updateMutation.isPending}
                    serverError={updateMutation.error?.message ?? null}
                    onSubmit={onSubmit}
                />}
        </section>
    )
}