import Card from "@/components/ui/Card"
import { useI18n } from "@/lib/i18n/useI18n"
import { todayLocal } from "@/lib/dates"
import { Booking, DashboardMetrics } from "@/types"

type Props = {
  bookings: Booking[]
  metrics?: DashboardMetrics
}

export default function StatsCards({ bookings, metrics }: Props) {
  const { t, locale } = useI18n()
  const today = todayLocal()

  const todayCount = bookings.filter((b) => b.date === today).length
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length

  const money = (value: string | number | undefined) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(Number(value ?? 0))

  // total_bookings counts confirmed ones only, so the rate is cancelled / (confirmed + cancelled).
  const confirmed = Number(metrics?.total_bookings ?? 0)
  const cancelled = Number(metrics?.cancelled_bookings ?? 0)
  const cancelRate =
    confirmed + cancelled > 0 ? Math.round((cancelled / (confirmed + cancelled)) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-4">
        <Card title={t("stats.totalRevenue")} value={money(metrics?.total_revenue)} />
        <Card title={t("stats.revenueMonth")} value={money(metrics?.revenue_this_month)} />
        <Card title={t("stats.bookings7")} value={Number(metrics?.bookings_last_7_days ?? 0)} />
        <Card title={t("stats.cancelRate")} value={`${cancelRate}%`} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Card title={t("stats.today")} value={todayCount} />
        <Card title={t("stats.confirmed")} value={confirmedCount} />
        <Card title={t("stats.total")} value={bookings.length} />
      </div>
    </div>
  )
}
