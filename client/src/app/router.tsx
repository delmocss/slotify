import { createBrowserRouter, Navigate } from "react-router-dom"
import DashboardLayout from "../components/layout/DashboardLayout"
import PublicLayout from "../components/layout/PublicLayout"
import LoginPage from "../features/auth/pages/LoginPage"
import RegisterPage from "../features/auth/pages/RegisterPage"
import ProtectedRoute from "../components/ProtectedRoute"
import ServicesPage from "../features/services/pages/ServicesPage"
import WorkingHoursPage from "../features/working-hours/pages/WorkingHoursPage"
import PublicBookingPage from "../features/public-booking/pages/PublicBookingPage"
import LandingPage from "../features/landing/LandingPage"

export const router = createBrowserRouter([
    {
        path: "/",
        element: <PublicLayout />,
        children: [
            {
                index: true,
                element: <LandingPage />,
            },
            {
                path: "b/:businessId",
                element: <PublicBookingPage />,
            },
        ],
    },
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
    },
    {
        path: "/dashboard/working-hours",
        element: (
            <ProtectedRoute>
                <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <WorkingHoursPage />,
            },
        ],
    },
    {
        path: "/b/:businessId",
        element: <PublicLayout />,
        children: [
            {
                index: true,
                element: <PublicBookingPage />,
            },
        ],
    }

])
