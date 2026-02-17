import { Outlet } from "react-router-dom"

export default function PublicLayout() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#2f302c] via-[#3B3C36] to-black flex flex-col items-center justify-center px-6 py-12">
      <Outlet />
    </div>
  )
}
