import { useQuery } from "@tanstack/react-query"
import { getBookings, exportBookings } from "../api/dashboard.api"
import StatsCards from "../components/StatsCards"
import BookingsTable from "../components/BookingsTable"
import { useState } from "react"
import BookingsChart from "../components/BookingsChart"
import { useAuth } from "../../auth/hooks/useAuth"
import Skeleton from "@/components/ui/Skeleton"
import { Booking } from "@/types"


export default function DashboardHomePage() {
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")
  const [search, setSearch] = useState("")
  const publicUrl = `${window.location.origin}/b/${user?.slug}`
  const today = new Date().toISOString().split("T")[0]
  const [fromDate, setFromDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]
  )
  const [toDate, setToDate] = useState(today)
  
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: getBookings,
  })

  const filteredBookings = bookings.filter((b: Booking) => {
    if (statusFilter !== "all" && b.status !== statusFilter) {
      return false
    }

    if (dateFilter) {
      const bookingDate = new Date(b.date)
        .toISOString()
        .split("T")[0]

      if (bookingDate !== dateFilter) {
        return false
      }
    }

    if (
      search &&
      !b.client_name.toLowerCase().includes(search.toLowerCase())
    ) {
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
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {user?.slug && (
        <div className="bg-surface border border-white/5 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Your public booking page:</p>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:underline font-medium"
          >
            {publicUrl}
          </a>
        </div>
      )}
      

      <div className="bg-surface border border-white/5 rounded-xl p-6 flex gap-4 flex-wrap items-end">
        <div>
          <label className="text-sm text-gray-300">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block bg-ashSoft border border-white/10 text-white placeholder-gray-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-copper"
          >
            <option value="all">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-300">Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="block bg-ashSoft border border-white/10 text-white placeholder-gray-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-copper"
          />
        </div>

        <div>
          <label className="text-sm text-gray-300">Search Client</label>
          <input
            type="text"
            placeholder="Client name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block bg-ashSoft border border-white/10 text-white placeholder-gray-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-copper"
          />
        </div>
      </div>

      <StatsCards bookings={filteredBookings} />
      <BookingsChart bookings={bookings} />


      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
          <h2 className="text-xl font-semibold text-white">
            Recent Bookings
          </h2>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Export From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-ashSoft border border-white/10 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-copper text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Export To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-ashSoft border border-white/10 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-copper text-sm"
              />
            </div>
            <button
              onClick={handleExport}
              className="bg-copper text-white px-4 py-2 rounded-lg font-medium hover:brightness-95 transition"
            >
              Export CSV
            </button>
          </div>
        </div>
        <BookingsTable bookings={filteredBookings} />
      </div>
    </div>
  )
}
