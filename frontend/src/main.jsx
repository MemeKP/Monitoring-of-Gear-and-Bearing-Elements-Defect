import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {
  createBrowserRouter,
  Route,
  Link,
  RouterProvider
} from 'react-router-dom'
import Landing from './routes/Landing.jsx'
import Dashboard from './routes/Dashboard.jsx'
import GraphPage from './routes/GraphPage.jsx'
import DashboardPageWrapper from './layout/DashboardPageWrapper.jsx'
import EquipmentListPage from './routes/EquipmentListPage.jsx'
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

const router = createBrowserRouter([

  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/dashboard/:siteId',
    element: <Dashboard />,
  },
  {
    path: '/equipment/test123',
    element: <GraphPage/>,
  },
  {
    path: '/dashboard/:siteId/equipment',
    element: <EquipmentListPage />,
  },
  {
    path: '/dashboard/:siteId/equipment/:equipmentId',
    element: <GraphPage />,
  },

])

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
  <StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />
  </StrictMode></QueryClientProvider>,
)
