import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AdminLayout } from './layout/AdminLayout'
import { ClientPage } from './pages/ClientsPage'
import { MastersPage } from './pages/MastersPage'
import { ServicesPage } from './pages/ServicesPage'
import { SchedulePage } from './pages/SchedulePage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to='/clients' replace /> },
      { path: 'clients', element: <ClientPage /> },
      { path: 'masters', element: <MastersPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'schedule', element: <SchedulePage /> },
    ]
  }
])

const App = () => { 
  return <RouterProvider router={router} />
}

export default App