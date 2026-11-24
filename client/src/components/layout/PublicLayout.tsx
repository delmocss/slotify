import { Outlet } from "react-router-dom"
import Footer from "./Footer"
import LanguageSwitcher from "../ui/LanguageSwitcher"

export default function PublicLayout() {
  return (
    <div className="relative min-h-[100dvh] w-full bg-gradient-to-br from-[#2f302c] via-[#3B3C36] to-black flex flex-col">
      <LanguageSwitcher className="absolute right-3 top-3 z-30 sm:right-4 sm:top-4" />
      <main className="flex-1 w-full flex items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
