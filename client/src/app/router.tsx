import { createBrowserRouter } from "react-router-dom"
import DashboardLayout from "../components/layout/DashboardLayout"
import PublicLayout from "../components/layout/PublicLayout"
import LoginPage from "../features/auth/pages/LoginPage"
import RegisterPage from "../features/auth/pages/RegisterPage"
import ProtectedRoute from "../components/ProtectedRoute"
import ServicesPage from "../features/services/pages/ServicesPage"

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/register",
        element: <RegisterPage />,
    },
    {
        path: "/dashboard",
        element: (
            <ProtectedRoute>
                <DashboardLayout />
            </ProtectedRoute>
        ),

    },
    {
        path: "/dashboard/services",
        element: (
            <ProtectedRoute>
                <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <ServicesPage />,
            },
        ],
    }

])
