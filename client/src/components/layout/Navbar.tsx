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
    <nav className="relative sticky top-0 z-40 w-full bg-[#141512]/70 text-white backdrop-blur-xl border-b border-white/[0.06]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-shrink-0 flex items-center gap-3 group"
            aria-label="Go to dashboard"
          >
            <div className="w-8 h-8 rounded-md border border-copper/30 bg-copper/10 flex items-center justify-center text-copper group-hover:border-copper/60 transition-colors">
              <span className="text-sm font-extrabold">S</span>
            </div>
            <h1 className="text-lg font-semibold text-white/90 hidden sm:block tracking-tight">
              Slotify
            </h1>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `relative px-4 py-2 rounded-full transition-all duration-200 text-xs font-semibold uppercase tracking-[0.12em] ${
                    isActive
                      ? "text-white bg-white/[0.06] after:content-[''] after:absolute after:left-4 after:right-4 after:bottom-1 after:h-px after:bg-copper/70"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]"
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
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03]">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span className="text-xs font-semibold text-gray-300">{user.name}</span>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={logout}
              className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-red-300 hover:bg-red-500/10 rounded-full border border-transparent hover:border-red-500/20 transition-all duration-200"
            >
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-full hover:bg-white/[0.06] transition"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              <span className={`block w-5 h-0.5 bg-white/80 transition-transform duration-300 ${isOpen ? "rotate-45 translate-y-1.5" : ""}`}></span>
              <span className={`block w-5 h-0.5 bg-white/80 transition-opacity duration-300 ${isOpen ? "opacity-0" : ""}`}></span>
              <span className={`block w-5 h-0.5 bg-white/80 transition-transform duration-300 ${isOpen ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-2 mb-4 rounded-xl border border-white/10 bg-[#12130f]/70 backdrop-blur-xl p-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg transition-all duration-200 text-xs font-semibold uppercase tracking-[0.12em] ${
                    isActive
                      ? "text-white bg-white/[0.06]"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            
            {user?.name && (
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                {user.name}
              </div>
            )}
            
            <button
              onClick={() => {
                logout()
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
