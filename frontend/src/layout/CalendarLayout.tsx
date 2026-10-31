import type { CalendarResponse } from '../types/calendar'

type CalendarLayoutProps = {
    calendar: CalendarResponse
}

const PIXELS_PER_MINUTE = 2
const SLOT_MINUTES = 30

const toMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
}

const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`
}

export const CalendarLayout = ({ calendar }: CalendarLayoutProps) => {
    const { masters, time_range } = calendar

    if (!time_range) {
        return <div className='p-4 mx-4 bg-surface rounded-lg'>
                <p className='text-danger font-bold italic'>На выбранную дату нет рабочего времени или записей</p>
            </div>
    }

    const rangeStart = toMinutes(time_range.starts_at)
    const rangeEnd = toMinutes(time_range.ends_at)
    const totalMinutes = rangeEnd - rangeStart
    const gridHeight = totalMinutes * PIXELS_PER_MINUTE

    const slots: number[] = []
    if (SLOT_MINUTES > 0) {
        for (let minutes = rangeStart; minutes <= rangeEnd; minutes += SLOT_MINUTES) {
            slots.push(minutes)
        }
    }

    return (
        <div className='mx-4 min-w-0 overflow-x-auto'>
            <div
                className='grid w-max min-w-full items-start bg-surface rounded-t-lg p-4'
                style={{
                    gridTemplateColumns: `64px repeat(${masters.length}, minmax(180px, 1fr))`
                }}
            >
                <div
                    className='sticky left-0 z-30'
                    style={{ backgroundColor: `color-mix(in srgb, var(--color-progress-bg) 60%, white)` }}
                >
                    <div className='flex py-2 items-center justify-center text-text-alt text-sm font-semibold border-b border-text-muted/15 border-dashed bg-accent-blue'>
                        Время
                    </div>
                    <div
                        className='relative'
                        style={{ height: gridHeight }}
                    >
                        {slots.map(minutes => {
                            const isFirst = minutes === rangeStart
                            return (
                                <div
                                    key={minutes}
                                    className={`absolute right-3 text-xs text-text-secondary
                                        ${isFirst ? 'top-0' : '-translate-y-1/2'}`
                                    }
                                    style={{
                                        top: (minutes - rangeStart) * PIXELS_PER_MINUTE,
                                    }}
                                >
                                    {formatMinutes(minutes)}
                                </div>
                            )
                        })}
                    </div>
                    <div className='h-5'/>
                </div>

                
                {masters.map(master => (
                    <div
                        key={master.id}
                        className='border-l border-text-muted/30 border-dashed'
                    >
                        <div className='bg-accent-purple flex py-2 items-center justify-center text-row-alt text-sm font-semibold border-b border-text-muted/15 border-dashed'>
                            {master.name}
                        </div>
                        <div
                            className='bg-row-alt relative'
                            style={{ height: gridHeight }}
                        >
                            {master.working_intervals.map((interval, index) => {
                                const start = toMinutes(interval.starts_at)
                                const end = toMinutes(interval.ends_at)

                                const visibleStart = Math.max(start, rangeStart)
                                const visibleEnd = Math.min(end, rangeEnd)

                                if (visibleStart >= visibleEnd) {
                                    return null
                                }
                                
                                return (
                                    <div
                                        key={`${interval.starts_at}-${index}-${master.name}`}
                                        className='pointer-events-none absolute inset-x-0 bg-surface'
                                        style={{
                                            top: (visibleStart - rangeStart) * PIXELS_PER_MINUTE,
                                            height: (visibleEnd - visibleStart) * PIXELS_PER_MINUTE
                                        }}
                                    />                                    
                                )
                            })}

                            {slots.map(minutes => (
                                <div
                                    key={minutes}
                                    className='pointer-events-none absolute inset-x-0 border border-text-muted/15 border-dashed'
                                    style={{
                                        top: (minutes - rangeStart) * PIXELS_PER_MINUTE
                                    }}
                                />
                            ))}

                            {master.appointments.map(appointment => {
                                const visibleStart = Math.max(appointment.start_minutes, rangeStart)
                                const visibleEnd = Math.min(appointment.end_minutes, rangeEnd)

                                const statusVar = appointment.status === 'completed' 
                                    ? 'var(--color-status-completed)' 
                                    : 'var(--color-status-pending)'

                                if (visibleStart >= visibleEnd) {
                                    return null
                                }

                                return (
                                    <article
                                        key={appointment.id}
                                        className={`absolute left-0 right-1 z-10 rounded-r-md flex text-xs`}
                                        style={{
                                            top: (visibleStart - rangeStart) * PIXELS_PER_MINUTE,
                                            height: (visibleEnd - visibleStart) * PIXELS_PER_MINUTE,
                                            backgroundColor: `color-mix(in srgb, ${statusVar} 40%, white)`
                                        }}
                                        title={`${appointment.client_name} - ${appointment.service_name}`}
                                    >   
                                        <div className='w-2' style={{ backgroundColor: `color-mix(in srgb, ${statusVar} 70%, white)` }}/>
                                        <div className='flex flex-col gap-1 rounded-r-md w-full overflow-y-auto min-h-0'>
                                            <div
                                                className='h-1 rounded-tr-md shrink-0'
                                                style={{
                                                    backgroundColor: `color-mix(in srgb, ${statusVar} 80%, black)`
                                                }}
                                            />
                                            <strong className='px-1.5 wrap-break-word'>
                                                {appointment.service_name}
                                            </strong>

                                            <span className='px-1.5 wrap-break-word'>
                                                {appointment.client_name}
                                            </span>

                                            <span className="px-1.5 pb-1.5 text-text-secondary">
                                                {formatMinutes(appointment.start_minutes)}
                                                {' - '}
                                                {formatMinutes(appointment.end_minutes)}
                                            </span>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    </div>
                ))}                
            </div>
        </div>
    )
}