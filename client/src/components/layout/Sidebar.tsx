import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../features/auth/hooks/useAuth"
import { useState } from "react"

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout: authLogout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const logout = () => {
    authLogout()
  }

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Services", path: "/dashboard/services" },
    { label: "Working Hours", path: "/dashboard/working-hours" },
  ]

  return (
    <nav className="w-full bg-ash text-white border-b border-copper/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-copper rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <h1 className="text-2xl font-bold text-white hidden sm:block">Slotify</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? "bg-copper text-white shadow-md"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* User Info */}
            {user?.name && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-200">{user.name}</span>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={logout}
              className="hidden sm:block px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
            >
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden flex flex-col gap-1 p-2 rounded-lg hover:bg-white/10 transition"
              aria-label="Toggle menu"
            >
              <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-copper/20 pt-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? "bg-copper text-white"
                      : "text-gray-300 hover:bg-white/10"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            
            {user?.name && (
              <div className="px-4 py-2 text-sm font-medium text-gray-300 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                {user.name}
              </div>
            )}
            
            <button
              onClick={() => {
                logout()
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
