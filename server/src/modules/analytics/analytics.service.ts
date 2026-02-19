import { pool } from "../../config/db"
import { AppError } from "../../utils/appError"

export class AnalyticsService {
  private async getBusinessBySlug(slug: string) {
    const result = await pool.query(
      "SELECT id FROM businesses WHERE slug = $1",
      [slug]
    )

    if (!result.rows.length) {
      throw new AppError("Business not found", 404)
    }

    return result.rows[0]
  }

  async getDashboardMetrics(slug: string) {
    const business = await this.getBusinessBySlug(slug)
    
    const result = await pool.query(
      `
      SELECT 
        COUNT(*) FILTER (WHERE b.status = 'confirmed') as total_bookings,
        COUNT(*) FILTER (WHERE b.status = 'cancelled') as cancelled_bookings,
        COALESCE(SUM(s.price) FILTER (WHERE b.status = 'confirmed'), 0) as total_revenue,
        COUNT(*) FILTER (
          WHERE b.status = 'confirmed' 
          AND b.date >= NOW() - INTERVAL '7 days'
        ) as bookings_last_7_days,
        COALESCE(SUM(s.price) FILTER (
          WHERE b.status = 'confirmed'
          AND b.date >= date_trunc('month', CURRENT_DATE)
        ), 0) as revenue_this_month
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.business_id = $1
      `,
      [business.id]
    )

    return result.rows[0]
  }

  async exportBookings(
  slug: string,
  from: string,
  to: string
) {
  const business = await this.getBusinessBySlug(slug)
  
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
    [business.id, from, to]
  )

  return result.rows
}

}

