import { Link } from 'react-router-dom'

export const Sidebar = () => {
    return(
        <div className='flex bg-surface min-w-50'>
            <div className='mt-6 mx-4 flex-1'>
                <div className='flex flex-col gap-1'>
                    <Link 
                        to='/clients' 
                        className='block w-full bg-primary hover:bg-primary-hover text-text-alt px-4 py-2 border-0 rounded-lg transition-colors'
                    >
                        Клиенты
                    </Link>
                    <Link 
                        to='/masters' 
                        className='block w-full bg-primary hover:bg-primary-hover text-text-alt px-4 py-2 border-0 rounded-lg transition-colors'
                    >
                        Мастера
                    </Link>
                    <Link 
                        to='/schedule' 
                        className='block w-full bg-primary hover:bg-primary-hover text-text-alt px-4 py-2 border-0 rounded-lg transition-colors'
                    >
                        Расписание
                    </Link>
                    <Link 
                        to='/services' 
                        className='block w-full bg-primary hover:bg-primary-hover text-text-alt px-4 py-2 border-0 rounded-lg transition-colors'
                    >
                        Услуги
                    </Link>
                </div>
            </div>
        </div>
    )
}