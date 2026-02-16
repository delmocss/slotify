import { RouteObject } from 'react-router-dom'
import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import DashboardPage from '../features/dashboard/pages/DashboardHomePage'
import PublicBookingPage from '../features/public-booking/pages/PublicBookingPage'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <PublicBookingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
]