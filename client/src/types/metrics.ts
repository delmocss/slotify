/** GET /analytics/metrics. Postgres sends NUMERIC and COUNT(*) as strings, hence Number() on use. */
export interface DashboardMetrics {
  total_revenue: string | number
  revenue_this_month: string | number
  bookings_last_7_days: string | number
  total_bookings: string | number
  cancelled_bookings: string | number
}
