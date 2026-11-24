import { Outlet } from "react-router-dom"
import { Info } from "lucide-react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { useAuth } from "../../features/auth/hooks/useAuth"

export default function DashboardLayout() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col min-h-screen bg-ashLight">
      <Navbar />

      {user?.sandbox && (
        <div className="border-b border-copper/20 bg-copper/[0.07]">
          <div className="mx-auto flex max-w-7xl items-start gap-2.5 px-4 py-2.5 text-sm text-copper/90 sm:px-6 lg:px-8">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <p>
              <span className="font-semibold">Demo session.</span> Everything you add or change here
              is private to your session and is discarded automatically — nobody else will see it.
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
