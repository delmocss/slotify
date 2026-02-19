import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"

export default function DashboardLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-ashLight">
      <Navbar />
      
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
