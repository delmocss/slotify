import { Outlet } from "react-router-dom"
import Footer from "./Footer"

export default function PublicLayout() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#2f302c] via-[#3B3C36] to-black flex flex-col">
      <main className="flex-1 w-full flex items-center justify-center px-6 py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
