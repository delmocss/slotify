import { useQuery } from "@tanstack/react-query"
import { getBookings } from "../api/dashboard.api"
import StatsCards from "../components/StatsCards"
import BookingsTable from "../components/BookingsTable"
import { useState } from "react"
import BookingsChart from "../components/BookingsChart"
import { useAuth } from "../../auth/hooks/useAuth"


export default function DashboardHomePage() {
  const { user } = useAuth()
  const publicUrl = `${window.location.origin}/b/${user?.slug}`
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")
  const [search, setSearch] = useState("")
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: getBookings,
  })

  const filteredBookings = bookings.filter((b: any) => {
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



  if (isLoading) return <div>Loading...</div>
  console.log("USER FROM DASHBOARD:", user)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {user?.slug && (
        <div className="bg-surface border border-white/5 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Your public booking page:</p>
          <a
            href={`http://localhost:3000/b/${user.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:underline font-medium"
          >
            http://localhost:3000/b/{user.slug}
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
        <h2 className="text-xl font-semibold mb-3 text-white">
          Recent Bookings
        </h2>
        <BookingsTable bookings={filteredBookings} />
      </div>
    </div>
  )
}
