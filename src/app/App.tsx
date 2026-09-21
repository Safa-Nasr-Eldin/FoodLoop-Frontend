import { MotionConfig } from 'framer-motion'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { Login } from '../pages/auth/Login'
import { Register } from '../pages/auth/Register'
import { Home } from '../pages/home/Home'
import { NotFound } from '../pages/NotFound'
import { PATHS } from './routes'

const router = createBrowserRouter([
  {
    element: <PageShell />,
    // Shown only while a lazy route (the dev page) loads on a cold start.
    hydrateFallbackElement: <div className="section" aria-busy="true" />,
    children: [
      { path: PATHS.home, element: <Home /> },
      { path: PATHS.login, element: <Login /> },
      { path: PATHS.register, element: <Register /> },
      // Dev-only reference page: lazy chunk, intentionally absent from every navigation.
      {
        path: PATHS.styleSystem,
        lazy: async () => ({ Component: (await import('../pages/dev/StylePlayground')).StylePlayground }),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])

// reducedMotion="user": Framer skips transform/layout animation when the OS asks for reduced motion.
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  )
}
