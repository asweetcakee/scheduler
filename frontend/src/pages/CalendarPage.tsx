import { useState } from 'react'
import { useCalendar } from '../hooks/calendar'
import { CalendarLayout } from '../layout/CalendarLayout'
import type { ISODate } from '../schemas/scheduleSchema'
import { useToday } from '../hooks/useToday'
import { CalendarToolbar } from '../components/calendar/CalendarToolbar'
import { MiniCalendar } from '../components/calendar/MiniCalendar'
import { AppointmentFormModal } from '../components/appointments/AppointmentFormModal'
import type { AppointmentModalState } from '../types/appointment'

export const CalendarPage = () => {
    const today = useToday()
    const [date, setDate] = useState<ISODate>(today)
    const [modalState, setModalState] = useState<AppointmentModalState>(null)
    const { data: calendar, isPending, isFetching, isError, error } = useCalendar(date)

    if (!calendar) return(
        <div
            className='flex mx-4 min-h-64 items-center justify-center bg-surface rounded-lg'
            role='status'
        >
            <p className='text-sm text-text-data'>
                Загрузка календаря...
            </p>
        </div>
    )

    const handleCreate = (masterId: number, startMinutes: number) => {
        setModalState({
            type: 'create',
            date: calendar.date,
            masterId,
            startMinutes
        })
    }

    const handleOpenEdit = (appointmentId: number) => {
        setModalState({
            type: 'appointment',
            appointmentId
        })
    }

    const handleClose = () => {
        setModalState(null)
    }

    return (
    <section className='flex w-full flex-col gap-3'>
        <CalendarToolbar date={date} today={today} onDateChange={setDate}/>

        <div className='mx-4 grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_240px]'>

            <div className='flex min-w-0 flex-col gap-3'>
                {isFetching && !isPending && (
                    <p className='text-sm text-text-data' role='status'>
                        Обновление календаря...
                    </p>
                )}

                {isPending ? (
                    <div
                        className='flex mx-4 min-h-64 items-center justify-center bg-surface rounded-lg'
                        role='status'
                    >
                        <p className='text-sm text-text-data'>
                            Загрузка календаря...
                        </p>
                    </div>
                ) : isError ? (
                    <div
                        className='mx-4 bg-surface rounded-lg'
                        role='alert'
                    >
                        <p className='font-medium text-danger'>
                            Не удалось загрузить календарь
                        </p>
                        <p className='mt-1 text-sm text-text-muted'>
                            {error instanceof Error
                                ? error.message
                                : 'Произошла неизвестная ошибка'}
                        </p>
                    </div>
                ) : calendar.masters.length === 0 ? (
                    <div className='flex mx-4 min-h-64 items-center justify-center bg-surface rounded-lg'>
                        <p className='text-sm text-text-data'>
                            На выбранную дату нет расписания.
                        </p>
                    </div>
                ) : (
                    <CalendarLayout
                        calendar={calendar}
                        onCreateAppointment={handleCreate}
                        onOpenAppointment={handleOpenEdit}
                    />
                )}
            </div>

            <aside className='min-w-0'>
                <MiniCalendar
                    date={date}
                    today={today}
                    onDateChange={setDate}
                />
            </aside>
        </div>
        {modalState !== null && (
            <AppointmentFormModal
                handleClose={handleClose}
            />
        )}
    </section>
    )
}