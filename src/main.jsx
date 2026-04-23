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

const router = createBrowserRouter([

    {
      path: '/',
      element: <Landing/>,
    },
    {
      path: '/dashboard',
      element: <Dashboard/>,
    },
    {
      path: '/:id/equipment',
      element: <h1>dashboard</h1>,
    },
    {
      path: '/:id/equipment',
      element: <h1>dashboard</h1>,
    },
    {
      path: '/graph',
      element: <GraphPage/>,
    },
 
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />
  </StrictMode>,
)
