import { Link } from 'react-router-dom'

export const Sidebar = () => {
    return(
        <div className='flex flex-row'>
            <Link to='/clients'>
                Clients
            </Link>
        </div>
    )
}