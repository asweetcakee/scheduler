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

    if (isPending && !calendar) return(
        <div
            className='flex mx-4 min-h-64 items-center justify-center bg-surface rounded-lg'
            role='status'
        >
            <p className='text-sm text-text-data'>
                Загрузка календаря...
            </p>
        </div>
    )

    if (isError && !calendar) return (
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
    )

    if (!calendar) return null

    const handleCreate = (masterId: number, startMinutes: number) => {
        setModalState({
            type: 'create',
            date: calendar.date,
            masterId,
            startMinutes
        })
    }

    const handleOpenAppointment = (appointmentId: number) => {
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

                {isError && (
                    <div className='p-3 bg-surface rounded-lg' role='alert'>
                        <p className='text-sm text-danger'>
                            Не удалось обновить календарь.
                            Отображаются ранее загруженные данные.
                        </p>
                    </div>
                )}

                {calendar.masters.length === 0 ? (
                    <div className='flex mx-4 min-h-64 items-center justify-center bg-surface rounded-lg'>
                        <p className='text-sm text-text-data'>
                            На выбранную дату нет расписания.
                        </p>
                    </div>
                ) : (
                    <CalendarLayout
                        calendar={calendar}
                        onCreateAppointment={handleCreate}
                        onOpenAppointment={handleOpenAppointment}
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
                modalState={modalState}
                onClose={handleClose}
            />
        )}
    </section>
    )
}