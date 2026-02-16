import { useQuery } from "@tanstack/react-query"
import { getBookings } from "../api/dashboard.api"
import StatsCards from "../components/StatsCards"
import BookingsTable from "../components/BookingsTable"
import { useState } from "react"
import BookingsChart from "../components/BookingsChart"


export default function DashboardHomePage() {
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

    if (dateFilter && b.date !== dateFilter) {
      return false
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="bg-white p-4 shadow rounded flex gap-4 flex-wrap items-end">
        <div>
          <label className="text-sm text-gray-500">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block border p-2 rounded"
          >
            <option value="all">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-500">Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="block border p-2 rounded"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">Search Client</label>
          <input
            type="text"
            placeholder="Client name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block border p-2 rounded"
          />
        </div>
      </div>

      <StatsCards bookings={filteredBookings} />
      <BookingsChart bookings={bookings} />


      <div>
        <h2 className="text-xl font-semibold mb-3">
          Recent Bookings
        </h2>
        <BookingsTable bookings={filteredBookings} />
      </div>
    </div>
  )
}
