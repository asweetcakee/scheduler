import { NavLink } from 'react-router-dom'

export const Sidebar = () => {
    const baseStyle = `block w-full px-4 py-2 border-0 rounded-lg`
    const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
        return `${baseStyle} ${
            isActive
            ? `bg-primary hover:bg-primary-hover text-text-alt shadow-lg shadow-primary/20 transition-colors`
            : `bg-page hover:bg-icon-bg text-text hover:text-text-alt transition-colors`
        }`
    }
    
    return(
        <div className='flex bg-surface min-w-50 shadow-lg shadow-primary/20 z-100'>
            <div className='mt-6 mx-4 flex-1'>
                <div className='flex flex-col gap-2'>
                    <NavLink 
                        to='/calendar' 
                        className={getNavLinkClass}
                    >
                        Календарь
                    </NavLink>
                    <NavLink 
                        to='/clients' 
                        className={getNavLinkClass}
                    >
                        Клиенты
                    </NavLink>
                    <NavLink 
                        to='/masters' 
                        className={getNavLinkClass}
                    >
                        Мастера
                    </NavLink>
                    <NavLink 
                        to='/schedule' 
                        className={getNavLinkClass}
                    >
                        Расписание
                    </NavLink>
                    <NavLink 
                        to='/services' 
                        className={getNavLinkClass}
                    >
                        Услуги
                    </NavLink>
                </div>
            </div>
        </div>
    )
}