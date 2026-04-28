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
const router = createBrowserRouter([

  {
    path: '/',
    element: <Landing />,
  },
  // {
  //   path: '/dashboard/:siteId',
  //   element: <DashboardPageWrapper />,
  // },
  {
    path: '/dashboard/:siteId',
    element: <Dashboard />,
  },
  // {
  //   path: '/dashboard',
  //   element: <DashboardPageWrapper />,
  // },
  {
    path: '/equipment/test123',
    element: <GraphPage/>,
  },
  // {
  //   path: '/equipment/:id',
  //   element: <h1>dashboard</h1>,
  // },
  {
    path: '/equipment',
    element: <EquipmentListPage />,
  },
  {
    path: '/graph',
    element: <GraphPage />,
  },

])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />
  </StrictMode>,
)
