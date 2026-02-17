import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-ashLight text-gray-100">
      <Sidebar />

      <main className="flex-1 p-8 bg-ashLight">
        <Outlet />
      </main>
    </div>
  )
}
