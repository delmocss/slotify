import { pool } from "../../config/db"

export class AnalyticsService {
  async getDashboardMetrics(businessId: string) {
    const result = await pool.query(
      `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'confirmed') as total_bookings,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
        COALESCE(SUM(price) FILTER (WHERE status = 'confirmed'), 0) as total_revenue,
        COUNT(*) FILTER (
          WHERE status = 'confirmed' 
          AND date >= NOW() - INTERVAL '7 days'
        ) as bookings_last_7_days,
        COALESCE(SUM(price) FILTER (
          WHERE status = 'confirmed'
          AND date >= date_trunc('month', CURRENT_DATE)
        ), 0) as revenue_this_month
      FROM bookings
      WHERE business_id = $1
      `,
      [businessId]
    )

    return result.rows[0]
  }
}
