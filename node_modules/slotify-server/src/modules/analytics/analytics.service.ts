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

  async exportBookings(
  businessId: string,
  from: string,
  to: string
) {
  const result = await pool.query(
    `
    SELECT 
      TO_CHAR(b.date, 'YYYY-MM-DD') as date,
      b.start_time,
      b.status,
      b.client_name,
      b.client_email,
      s.name as service_name,
      s.price
    FROM bookings b
    JOIN services s ON s.id = b.service_id
    WHERE b.business_id = $1
      AND b.date BETWEEN $2 AND $3
    ORDER BY b.date ASC
    `,
    [businessId, from, to]
  )

  return result.rows
}

}

