import { useQuery } from "@tanstack/react-query"
import { getBookings } from "../api/dashboard.api"
import StatsCards from "../components/StatsCards"
import BookingsTable from "../components/BookingsTable"

export default function DashboardHomePage() {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: getBookings,
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <StatsCards bookings={bookings} />

      <div>
        <h2 className="text-xl font-semibold mb-3">
          Recent Bookings
        </h2>
        <BookingsTable bookings={bookings} />
      </div>
    </div>
  )
}
