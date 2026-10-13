import { useNavigate, useParams } from 'react-router-dom'
import { useToday } from '../../hooks/useToday'
import { useCreateVersion, useVersionById, useVersions } from '../../hooks/schedule'
import { classifyVersions } from '../../utils/scheduleVersions'
import type { CreateVersionBody } from '../../types/schedule'
import { Badge } from '../../components/shared/Badge'
import { InfoItem } from '../../components/masters/schedule/InfoItem'
import { VersionEditor } from '../../components/masters/schedule/VersionEditor'
import type { ISODate } from '../../schemas/scheduleSchema'
import { useState } from 'react'

export const ScheduleVersionCreatePage = () => {
    const { masterId } = useParams()
    const masterIdNum = Number(masterId)
    const today = useToday()
    const navigate = useNavigate()

    const [selectedDate, setSelectedDate] = useState<ISODate | null>(null)

    const { data: versions, isLoading: isVersionsLoading, error: versionsError } = useVersions(masterIdNum)
    const { sorted, current } = classifyVersions(versions ?? [], today)

    const { data: currentSchedule, isLoading: isTemplateLoading } = useVersionById(masterIdNum, current?.id ?? 0, Boolean(current))

    const createMutation = useCreateVersion(masterIdNum)

    if (isVersionsLoading || isTemplateLoading) return <p className='m-6'>Загрузка...</p>
    if (versionsError) return <p className='m-6'>Ошибка: {versionsError.message}</p>

    const takenDates = sorted.map(version => version.effective_from)
    const scheduleBody: CreateVersionBody = {
        effective_from: '',
        intervals: (currentSchedule?.intervals ?? []).map(interval => ({
            day_of_week: interval.day_of_week, 
            starts_at: interval.starts_at, 
            ends_at: interval.ends_at
        }))
    }

    const previous = selectedDate
        ? takenDates.filter(d => d < selectedDate).at(-1)
        : undefined
    const following = selectedDate
        ? takenDates.find(d => d > selectedDate)
        : undefined

    const handleTakenDate = (date: ISODate) => {
        setSelectedDate(date || null)
    }

    const onSubmit = (data: CreateVersionBody) => {
        createMutation.mutate(
            data,
            { onSuccess: () => navigate(`/schedule/${masterIdNum}`) }
        )
    }
    return (
        <section className='flex flex-col gap-2'>
            <div className='flex flex-wrap items-start justify-between gap-2 pb-4 border-b border-dashed border-border/50'>
                <div className='flex flex-col gap-2'>
                    <div className='flex gap-2'>
                        <span className='text-lg font-bold text-text-data'>Версия:</span>
                        <Badge variant='info' text='Будущая' sizes='px-2 py-1'/>
                        <Badge variant='success' text='создание' sizes='px-2 py-1'/>
                    </div>
                    {current && <InfoItem label='Сейчас действует' date={current.effective_from} />}
                    {previous && previous !== current?.effective_from && <InfoItem label='Предыдущая версия' date={previous} />}
                    {following && <InfoItem label='Следующая версия' date={following} />}
                </div>
            </div>
            <VersionEditor
                key={masterIdNum}
                initial={scheduleBody}
                takenDates={takenDates}
                today={today}
                isSubmitting={createMutation.isPending}
                serverError={createMutation.error?.message ?? null}
                handleTakenDate={handleTakenDate}
                onSubmit={onSubmit}
            />
        </section>
    )
}