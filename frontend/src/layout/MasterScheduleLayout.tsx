import { Link, Outlet, useParams } from 'react-router-dom'
import { useMasterById } from '../hooks/masters'
import { formatPhoneDisplay } from '../components/shared/phone'

export const MasterScheduleLayout = () => {
    const { masterId } = useParams()
    const id = Number(masterId)
    const isValid = Number.isInteger(id) && id > 0

    const { data: master, isLoading, error } = useMasterById(id, isValid)
    if (!isValid) return <p className='m-6'>Мастер не найден</p>
    if (isLoading) return <p className='m-6'>Loading...</p>
    if (error) return <p className='m-6'>Ошибка: {error.message}</p>
    if (!master) return <p className='m-6'>Мастер не найден</p>

    return (
        <section className='mx-6 my-3 min-h-screen bg-page flex flex-col gap-2'>
            <Link
                to='/schedule'
                className=' w-fit px-3 py-2 bg-surface text-sm font-medium text-text-secondary hover:bg-primary hover:text-text-alt transition-colors rounded-lg'
            >
                К списку мастеров
            </Link>
            <div className='flex items-center gap-4 px-3 py-3 bg-surface rounded-lg'>
                <div className='flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg shrink-0'>
                    {master.name.charAt(0)}
                </div>
                <div>
                    <h1 className='text-xl text-text-data font-bold leading-tight'>{master.name}</h1>
                    <p className='text-sm text-text-secondary mt-0.5'>+7 {formatPhoneDisplay(master.phone)}</p>
                </div>
            </div>
            <div className='w-full p-4 bg-surface rounded-lg'>
                <Outlet />
            </div>
        </section>
    )
}