import Card from "@/components/ui/Card"
import { Booking } from "@/types"

type Props = {
  bookings: Booking[]
  metrics?: {
    total_revenue: number
    revenue_this_month: number
    bookings_last_7_days: number
    total_bookings: number
    cancelled_bookings: number
  }
}

export default function StatsCards({ bookings, metrics }: Props) {
  const today = new Date().toISOString().split("T")[0]

  const todayCount = bookings.filter(
    (b) => b.date === today
  ).length

  const confirmedCount = bookings.filter(
    (b) => b.status === "confirmed"
  ).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card title="Total Revenue" value={`€${metrics?.total_revenue ?? 0}`} />
        <Card title="Revenue This Month" value={`€${metrics?.revenue_this_month ?? 0}`} />
        <Card title="Bookings (7 days)" value={metrics?.bookings_last_7_days ?? 0} />
        <Card
          title="Cancel Rate"
          value={
            metrics?.total_bookings
              ? `${Math.round(
                  (metrics.cancelled_bookings / metrics.total_bookings) * 100
                )}%`
              : "0%"
          }
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card title="Bookings Today" value={todayCount} />
        <Card title="Total Confirmed" value={confirmedCount} />
        <Card title="Total Bookings" value={bookings.length} />
      </div>
    </div>
  )
}
