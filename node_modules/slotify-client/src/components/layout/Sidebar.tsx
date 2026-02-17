import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../features/auth/hooks/useAuth"

export default function Sidebar() {
  const navigate = useNavigate()
  const { user, logout: authLogout } = useAuth()

  const logout = () => {
    authLogout()
  }

  return (
    <div className="w-64 bg-ash text-white min-h-screen flex flex-col border-r border-white/5">
      <div className="p-6">
        {/* Logo y nombre del negocio */}
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-bold">Slotify</h1>

          {user?.name && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-300">{user.name}</span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="mt-6 flex flex-col gap-2">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `block p-2 rounded transition ${
                  isActive
                    ? "bg-copper text-white"
                    : "hover:bg-white/10 text-gray-300"
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/dashboard/services"
              className={({ isActive }) =>
                `block p-2 rounded transition ${
                  isActive
                    ? "bg-copper text-white"
                    : "hover:bg-white/10 text-gray-300"
                }`
              }
            >
              Services
            </NavLink>

            <NavLink
              to="/dashboard/working-hours"
              className={({ isActive }) =>
                `block p-2 rounded transition ${
                  isActive
                    ? "bg-copper text-white"
                    : "hover:bg-white/10 text-gray-300"
                }`
              }
            >
              Working Hours
            </NavLink>

            <button
              onClick={logout}
              className="mt-4 px-4 py-2 text-sm text-red-400 hover:bg-white/10 rounded transition"
            >
              Logout
            </button>
          </div>
      </div>
    </div>
  )
}
