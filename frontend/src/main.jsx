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
import EquipmentListPage from './routes/EquipmentListPage.jsx'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import MachineIndexPage from './routes/MachineIndexPage.jsx'

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
    path: '/equipment/:equipmentId',
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
  {
    path: '/dashboard/:siteId/machine-index',
    element: <MachineIndexPage />
  },

])

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
  <StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />
  </StrictMode></QueryClientProvider>,
)
