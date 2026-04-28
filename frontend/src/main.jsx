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

const router = createBrowserRouter([

    {
      path: '/',
      element: <Landing/>,
    },
    {
      path: '/:id',
      element: <h1>dashboard</h1>,
    },
    {
      path: '/:id/equipment',
      element: <h1>dashboard</h1>,
    },
     {
      path: '/:id/equipment',
      element: <h1>dashboard</h1>,
    },
 
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />
  </StrictMode>,
)
