import { Sidebar } from './Sidebar'
import { Outlet } from 'react-router-dom'

export const AdminLayout = () => {
    return(
        <div className='flex'>
            <Sidebar />
            <main className='flex-1'>
                <Outlet />
            </main>
        </div>
    )
}