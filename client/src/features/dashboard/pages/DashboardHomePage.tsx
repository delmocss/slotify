import { useQuery } from "@tanstack/react-query"
import { getBookings, getMetrics, exportBookings } from "../api/dashboard.api"
import StatsCards from "../components/StatsCards"
import BookingsTable from "../components/BookingsTable"
import { useState } from "react"
import BookingsChart from "../components/BookingsChart"
import { useAuth } from "../../auth/hooks/useAuth"
import { useI18n } from "@/lib/i18n/useI18n"
import DatePicker from "@/components/ui/DatePicker"
import { toLocalISODate, todayLocal } from "@/lib/dates"
import Skeleton from "@/components/ui/Skeleton"
import { Booking, DashboardMetrics } from "@/types"

export default function DashboardHomePage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")
  const [search, setSearch] = useState("")
  // user from useAuth() is the full /auth/me response: { user, organizations, slug }
  const slug = (user as { slug?: string } | undefined)?.slug
  const publicUrl = `${window.location.origin}/b/${slug}`
  const today = todayLocal()
  const [fromDate, setFromDate] = useState(() =>
    toLocalISODate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  )
  const [toDate, setToDate] = useState(today)

  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ["metrics"],
    queryFn: getMetrics,
  })

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: getBookings,
  })

  const filteredBookings = bookings.filter((b: Booking) => {
    if (statusFilter !== "all" && b.status !== statusFilter) {
      return false
    }

    if (dateFilter) {
      const bookingDate = new Date(b.date).toISOString().split("T")[0]

      if (bookingDate !== dateFilter) {
        return false
      }
    }

    if (search && !b.client_name.toLowerCase().includes(search.toLowerCase())) {
      return false
    }

    return true
  })

  const handleExport = async () => {
    const blob = await exportBookings(fromDate, toDate)

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "bookings.csv")
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{t("dashboard.title")}</h1>

      {slug && (
        <div className="rounded-xl border border-white/5 bg-surface p-4 sm:p-6">
          <p className="mb-1 text-sm text-gray-400">{t("dashboard.publicPage")}</p>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-medium text-gray-300 hover:underline"
          >
            {publicUrl}
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-white/5 bg-surface p-4 sm:grid-cols-2 sm:p-6 lg:flex lg:flex-wrap lg:items-end">
        <div>
          <label className="text-sm text-gray-300">{t("dashboard.filter.status")}</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full rounded-md border border-white/10 bg-ashSoft p-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-copper lg:w-auto lg:p-2"
          >
            <option value="all">{t("dashboard.filter.all")}</option>
            <option value="confirmed">{t("dashboard.filter.confirmed")}</option>
            <option value="cancelled">{t("dashboard.filter.cancelled")}</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-300">{t("dashboard.filter.date")}</label>
          <DatePicker
            value={dateFilter}
            onChange={setDateFilter}
            placeholder={t("dashboard.filter.anyDate")}
            clearable
            aria-label={t("dashboard.filter.byDate")}
            className="w-full lg:w-44"
          />
        </div>

        <div>
          <label className="text-sm text-gray-300">{t("dashboard.filter.search")}</label>
          <input
            type="text"
            placeholder={t("dashboard.filter.clientName")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-md border border-white/10 bg-ashSoft p-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-copper lg:w-auto lg:p-2"
          />
        </div>
      </div>

      <StatsCards bookings={filteredBookings} metrics={metrics} />
      <BookingsChart bookings={bookings} />

      <div>
        <div className="mb-3 flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-end">
          <h2 className="text-xl font-semibold text-white">{t("dashboard.recent")}</h2>
          <div className="grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap [&>div]:min-w-0">
            <div>
              <label className="text-sm text-gray-400 block mb-1">
                {t("dashboard.exportFrom")}
              </label>
              <DatePicker
                value={fromDate}
                onChange={setFromDate}
                max={toDate || undefined}
                aria-label={t("dashboard.exportFromAria")}
                className="w-full sm:w-44"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">{t("dashboard.exportTo")}</label>
              <DatePicker
                value={toDate}
                onChange={setToDate}
                min={fromDate || undefined}
                aria-label={t("dashboard.exportToAria")}
                className="w-full sm:w-44"
              />
            </div>
            <button
              onClick={handleExport}
              className="col-span-2 rounded-lg bg-copper px-4 py-2.5 font-medium text-white transition hover:brightness-95 sm:col-span-1"
            >
              {t("dashboard.exportCsv")}
            </button>
          </div>
        </div>
        <BookingsTable bookings={filteredBookings} />
      </div>
    </div>
  )
}
