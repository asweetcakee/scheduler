import { Link, useParams } from 'react-router-dom'
import { getToday } from '../../hooks/helper'
import { useVersionForDate, useVersions } from '../../hooks/schedule'
import { VersionSummary } from '../../components/masters/schedule/VersionSummary'
import { WeekSchedule } from '../../components/masters/schedule/WeekSchedule'

export const MasterScheduleOverviewPage = () => {
    const { masterId } = useParams()
    const id = Number(masterId)
    const today = getToday()

    const { data: schedule, isLoading: isScheduleLoading, error: scheduleError } = useVersionForDate(id, today)
    const { data: versions, isLoading: isVersionsLoading, error: versionsError } = useVersions(id)
    
    if (isScheduleLoading || isVersionsLoading) return <p className='m-6'>Загрузка...</p>
    if (scheduleError || versionsError) return <p className='m-6'>Ошибка: {(scheduleError ?? versionsError)?.message}</p>
    if (!schedule || !versions) return null

    const linkClass = 'px-3 py-2 rounded-md bg-accent-purple hover:bg-accent-purple-hover text-text-alt text-sm font-semibold transition-colors'

    return (
        <section className='flex flex-col gap-2'>
            <div className='flex flex-wrap items-start justify-between gap-2 pb-4 border-b border-dashed border-border/50'>
                <VersionSummary versions={versions} today={today} />
                <div className='flex gap-2'>
                    <Link to={`/schedule/${id}/versions`} className={linkClass}>
                        Посмотреть версии
                    </Link>
                    <Link to={`/schedule/${id}/versions/new`} className={linkClass}>
                        Создать версию
                    </Link>
                </div>
            </div>
            <WeekSchedule intervals={schedule.intervals} />
        </section>
    )
}