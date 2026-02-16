import { createBrowserRouter } from "react-router-dom"
import DashboardLayout from "../components/layout/DashboardLayout"
import PublicLayout from "../components/layout/PublicLayout"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        path: "b/:businessId",
        element: <div>Public Booking Page</div>,
      },
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <div>Dashboard Home</div>,
      },
    ],
  },
])
