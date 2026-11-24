import Card from "@/components/ui/Card"
import { useI18n } from "@/lib/i18n/useI18n"
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
  const { t } = useI18n()
  const today = new Date().toISOString().split("T")[0]

  const todayCount = bookings.filter((b) => b.date === today).length

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-4">
        <Card title={t("stats.totalRevenue")} value={`€${metrics?.total_revenue ?? 0}`} />
        <Card title={t("stats.revenueMonth")} value={`€${metrics?.revenue_this_month ?? 0}`} />
        <Card title={t("stats.bookings7")} value={metrics?.bookings_last_7_days ?? 0} />
        <Card
          title={t("stats.cancelRate")}
          value={
            metrics?.total_bookings
              ? `${Math.round((metrics.cancelled_bookings / metrics.total_bookings) * 100)}%`
              : "0%"
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Card title={t("stats.today")} value={todayCount} />
        <Card title={t("stats.confirmed")} value={confirmedCount} />
        <Card title={t("stats.total")} value={bookings.length} />
      </div>
    </div>
  )
}
