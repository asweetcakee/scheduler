import { Link, useParams } from 'react-router-dom'
import { formatDate, getToday } from '../../hooks/helper'
import { useRemoveVersion, useVersions } from '../../hooks/schedule'
import { classifyVersions, type ClassifiedVersion } from '../../utils/scheduleVersions'

export const ScheduleVersionsListPage = () => {
    const { masterId } = useParams()
    const id = Number(masterId)
    const today = getToday()

    const { data: versions, isLoading: isVersionsLoading, error: versionsError } = useVersions(id)
    const deleteMutation = useRemoveVersion(id)
    if (isVersionsLoading) return <p className='m-6'>Загрузка...</p>
    if (versionsError) return <p className='m-6'>Ошибка: {versionsError.message}</p>
    if (!versions) return null
    
    const { current, future, historical } = classifyVersions(versions, today)
    const dateStyle = 'w-32 px-3 py-1.5 text-center text-text-data text-sm font-medium rounded-md'
    const linkClass = 'flex items-center w-32 justify-center px-2 py-1 rounded-md text-sm font-semibold transition-colors cursor-pointer'

    const handleDelete = (version: ClassifiedVersion) => {
        const isConfirmed = window.confirm(`Вы действительно хотите удалить версию ${formatDate(version.effective_from)}?`)
        if (isConfirmed) {
            deleteMutation.mutate(version.id)
        }
    }
    return (
        <section className='flex flex-col gap-3'>
            <h2 className='flex text-lg font-bold text-text-data'>Версии расписания</h2>
            <div className='flex flex-col gap-3 max-w-100 w-full'>
                
                <div className='flex flex-col gap-2 w-full'>
                    <span className='font-semibold text-text-secondary italic text-sm'>Текущая</span>
                    <div className='flex gap-2 flex-wrap'>
                        {current ? (
                            <>
                                <span className={`${dateStyle} bg-status-active/30`}>{formatDate(current.effective_from)}</span>
                                <Link
                                    to={`/schedule/${id}`}
                                    className={`${linkClass} bg-accent-purple hover:bg-accent-purple-hover text-text-alt`}
                                >
                                    Посмотреть
                                </Link>
                            </>
                        ) : ( <span className='text-text-secondary'>-</span> )}
                    </div>
                </div>
                
                <div className='flex flex-col gap-2 w-full'>
                    <span className='font-semibold text-text-secondary italic text-sm'>Будущая</span>
                    <div className='flex flex-col gap-2'>
                        {future.map(version => (
                            <div
                                key={version.id}
                                className='flex gap-2 flex-wrap'
                            >
                                <span className={`${dateStyle} bg-status-pending/30`}>
                                    {formatDate(version.effective_from)}
                                </span>
                                <Link
                                    to={`/schedule/${id}/versions/${version.id}`}
                                    className={`${linkClass} bg-accent-purple hover:bg-accent-purple-hover text-text-alt`}
                                >
                                    Изменить
                                </Link>
                                <button
                                    className={`${linkClass} bg-danger hover:bg-danger-hover text-text-alt`}
                                    onClick={() => handleDelete(version)}
                                    disabled={deleteMutation.isPending}
                                >
                                    Удалить
                                </button>
                            </div>
                        ))}
                        {future.length === 0 && (
                            <span className='text-text-secondary'>-</span>
                        )}
                    </div>
                    {deleteMutation.error && (
                        <span className='text-danger text-sm'>
                            {deleteMutation.error.message}
                        </span>
                    )}
                </div>
                
                <div className='flex flex-col gap-2 w-full'>
                    <span className='font-semibold text-text-secondary italic text-sm'>Историческая</span>
                    <div className='flex flex-col gap-2'>
                        {historical.map(version => (
                            <div
                                key={version.id}
                                className='flex gap-2 flex-wrap'
                            >
                                <span className={`${dateStyle} bg-status-pending/30`}>
                                    {formatDate(version.effective_from)}
                                </span>
                                <Link
                                    to={`/schedule/${id}/versions/${version.id}`}
                                    className={`${linkClass} bg-accent-purple hover:bg-accent-purple-hover text-text-alt`}
                                >
                                    Посмотреть
                                </Link>
                            </div>
                        ))}
                        {historical.length === 0 && (
                            <span className='text-text-secondary'>-</span>
                        )}
                    </div>
                </div>

                <div className='flex items-center justify-center w-full'>
                    <Link
                        to={`/schedule/${id}/versions/new`}
                        className={`${linkClass} w-full px-4 py-2 bg-accent-purple hover:bg-accent-purple-hover text-text-alt inline-flex`}
                    >
                        + Создать новую версию
                    </Link>
                </div>
            </div>
        </section>
    )
}