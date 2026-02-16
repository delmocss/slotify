import { Outlet } from "react-router-dom"

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="p-4 bg-white shadow">
        <h1 className="font-bold">Slotify Dashboard</h1>
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
