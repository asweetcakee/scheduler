import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AdminLayout } from './layout/AdminLayout'
import { ClientPage } from './pages/ClientsPage'
import { MastersPage } from './pages/MastersPage'
import { ServicesPage } from './pages/ServicesPage'
import { SchedulePage } from './pages/schedule/SchedulePage'
import { MasterScheduleLayout } from './layout/MasterScheduleLayout'
import { MasterScheduleOverviewPage } from './pages/schedule/MasterScheduleOverviewPage'
import { ScheduleVersionsListPage } from './pages/schedule/ScheduleVersionsListPage'
import { ScheduleVersionCreatePage } from './pages/schedule/ScheduleVersionCreatePage'
import { ScheduleVersionDetailPage } from './pages/schedule/ScheduleVersionDetailPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to='/clients' replace /> },
      { path: 'clients', element: <ClientPage /> },
      { path: 'masters', element: <MastersPage /> },
      { path: 'services', element: <ServicesPage /> },
      { 
        path: 'schedule', 
        children: [
          { index: true, element: <SchedulePage /> },
          {
            path: ':masterId',
            element: <MasterScheduleLayout />,
            children: [
              { index: true, element: <MasterScheduleOverviewPage /> },
              { path: 'versions', element: <ScheduleVersionsListPage /> },
              { path: 'versions/new', element: <ScheduleVersionCreatePage /> },
              { path: 'versions/:versionId', element: <ScheduleVersionDetailPage /> },
            ]
          }
        ] 
      },
    ]
  }
])

const App = () => { 
  return <RouterProvider router={router} />
}

export default App