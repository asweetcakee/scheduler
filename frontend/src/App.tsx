import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AdminLayout } from './layout/AdminLayout'
import { ClientPage } from './pages/ClientsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to='/clients' replace /> },
      { path: 'clients', element: <ClientPage /> }
    ]
  }
])

const App = () => { 
  return <RouterProvider router={router} />
}

export default App