import { Sidebar } from './Sidebar'
import { Outlet } from 'react-router-dom'

export const AdminLayout = () => {
    return(
        <div className='flex min-h-screen'>
            <Sidebar />
            <main className='flex-1 min-w-0 bg-page'>
                <Outlet />
            </main>
        </div>
    )
}