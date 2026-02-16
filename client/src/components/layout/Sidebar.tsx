import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../features/auth/hooks/useAuth"

export default function Sidebar() {
  const navigate = useNavigate()
  const { user, logout: authLogout } = useAuth()

  const logout = () => {
    authLogout()
  }

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo y nombre del negocio */}
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold">Slotify</h1>
            
            {user?.name && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `px-4 py-2 rounded transition ${
                  isActive ? "bg-black text-white" : "hover:bg-gray-100 text-gray-700"
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/dashboard/services"
              className={({ isActive }) =>
                `px-4 py-2 rounded transition ${
                  isActive ? "bg-black text-white" : "hover:bg-gray-100 text-gray-700"
                }`
              }
            >
              Services
            </NavLink>

            <NavLink
              to="/dashboard/working-hours"
              className={({ isActive }) =>
                `px-4 py-2 rounded transition ${
                  isActive ? "bg-black text-white" : "hover:bg-gray-100 text-gray-700"
                }`
              }
            >
              Working Hours
            </NavLink>

            <button
              onClick={logout}
              className="ml-4 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
