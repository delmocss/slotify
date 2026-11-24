import { useEffect, useRef, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import {
  CalendarClock,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Scissors,
  X,
} from "lucide-react"
import { useAuth } from "../../features/auth/hooks/useAuth"
import Logo from "../ui/Logo"
import LanguageSwitcher from "../ui/LanguageSwitcher"
import { useI18n } from "@/lib/i18n/useI18n"

const navItems = [
  { labelKey: "nav.dashboard", path: "/dashboard", icon: LayoutDashboard },
  { labelKey: "nav.services", path: "/dashboard/services", icon: Scissors },
  { labelKey: "nav.workingHours", path: "/dashboard/working-hours", icon: CalendarClock },
] as const

function initialsOf(label: string) {
  const parts = label
    .replace(/@.*/, "")
    .split(/[\s._-]+/)
    .filter(Boolean)
  return (parts[0]?.[0] ?? "?").concat(parts[1]?.[0] ?? "").toUpperCase()
}

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { t } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const businessName = user?.organizations[0]?.name ?? t("nav.myBusiness")
  const sandbox = !!user?.sandbox
  // Sandbox emails are internal identifiers, not something a visitor should see.
  const shownEmail = sandbox ? (user?.demoEmail ?? "demo") : (user?.user.email ?? "")

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#141512]/80 pt-[env(safe-area-inset-top)] text-white backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper/50 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-3 sm:h-16 sm:gap-4">
          {/* Brand */}
          <button
            onClick={() => navigate("/dashboard")}
            className="group flex flex-shrink-0 items-center gap-3"
            aria-label={t("nav.goToDashboard")}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-copper/30 bg-gradient-to-br from-copper/25 to-copper/5 text-copper shadow-inner shadow-copper/10 transition group-hover:border-copper/60">
              <Logo className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-white md:max-lg:hidden">
              Slotify
            </span>
          </button>

          {/* Desktop navigation */}
          <nav
            aria-label={t("nav.main")}
            className="hidden items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1 md:flex"
          >
            {navItems.map(({ labelKey, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-copper/15 text-white shadow-sm ring-1 ring-copper/30"
                      : "text-gray-400 hover:bg-white/[0.05] hover:text-gray-100"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-4 w-4 ${isActive ? "text-copper" : ""}`}
                      aria-hidden="true"
                    />
                    {t(labelKey)}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher className="hidden sm:inline-flex" />

            {sandbox && (
              <span
                title={t("demo.badgeTitle")}
                className="hidden items-center gap-1.5 rounded-full border border-copper/30 bg-copper/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-copper xl:inline-flex"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-copper" />
                {t("demo.badge")}
              </span>
            )}

            <div ref={menuRef} className="relative hidden sm:block">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-2.5 transition hover:border-white/20 hover:bg-white/[0.06] xl:gap-2.5 xl:pr-3"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-copper to-[#a8683a] text-[11px] font-bold text-[#1a1b17]">
                  {initialsOf(businessName)}
                </span>
                <span className="hidden max-w-[9rem] truncate text-sm font-medium text-gray-200 xl:block">
                  {businessName}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#1f201c] shadow-2xl shadow-black/50"
                >
                  <div className="border-b border-white/[0.06] px-4 py-3">
                    <p className="truncate text-sm font-semibold text-white">{businessName}</p>
                    <p className="truncate text-xs text-gray-500">{shownEmail}</p>
                  </div>
                  <button
                    role="menuitem"
                    onClick={logout}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-gray-300 transition hover:bg-white/[0.06] md:hidden"
              aria-label={t("nav.toggleMenu")}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileOpen && (
          <div className="mb-4 space-y-1 rounded-xl border border-white/10 bg-[#1a1b17]/95 p-2 md:hidden">
            {navItems.map(({ labelKey, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/dashboard"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-copper/15 text-white ring-1 ring-copper/30"
                      : "text-gray-400 hover:bg-white/[0.05] hover:text-gray-100"
                  }`
                }
              >
                <Icon className="h-4 w-4 text-copper" aria-hidden="true" />
                {t(labelKey)}
              </NavLink>
            ))}

            <div className="mt-2 border-t border-white/[0.06] px-3 pt-3">
              <LanguageSwitcher className="mb-3" />
              <p className="truncate text-sm font-semibold text-white">{businessName}</p>
              <p className="truncate text-xs text-gray-500">{shownEmail}</p>
              {sandbox && (
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-copper">
                  {t("demo.badge")}
                </p>
              )}
            </div>
            <button
              onClick={logout}
              className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition hover:bg-white/[0.05] hover:text-white"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {t("nav.logout")}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
