import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="max-w-7xl mx-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
