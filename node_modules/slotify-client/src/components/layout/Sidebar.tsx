import { NavLink, useNavigate } from "react-router-dom"

export default function Sidebar() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  return (
    <div className="w-64 bg-white border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">Slotify</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `block p-2 rounded ${
              isActive ? "bg-black text-white" : "hover:bg-gray-100"
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/dashboard/services"
          className={({ isActive }) =>
            `block p-2 rounded ${
              isActive ? "bg-black text-white" : "hover:bg-gray-100"
            }`
          }
        >
          Services
        </NavLink>

        <NavLink
          to="/dashboard/working-hours"
          className={({ isActive }) =>
            `block p-2 rounded ${
              isActive ? "bg-black text-white" : "hover:bg-gray-100"
            }`
          }
        >
          Working Hours
        </NavLink>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="text-red-500 text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
