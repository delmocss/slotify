import { Request, Response } from "express"
import { AnalyticsService } from "./analytics.service"
import { pool } from "../../config/db"
import { AppError } from "../../utils/appError"
import { toCsv } from "../../utils/csv"

const service = new AnalyticsService()

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

async function getSlugFromOrganizationId(organizationId: string): Promise<string> {
  const result = await pool.query("SELECT slug FROM businesses WHERE id = $1", [organizationId])
  if (!result.rows.length) {
    throw new AppError("Business not found", 404)
  }
  return result.rows[0].slug
}

// Errors are thrown (not caught here): Express 5 forwards them to the central handler, which
// answers 4xx for AppError and a generic 500 otherwise, never leaking internal messages.
export async function getDashboardMetrics(req: Request, res: Response) {
  const slug = await getSlugFromOrganizationId(req.context!.organizationId)
  const data = await service.getDashboardMetrics(slug)
  res.json(data)
}

export async function exportBookings(req: Request, res: Response) {
  const from = typeof req.query.from === "string" ? req.query.from : ""
  const to = typeof req.query.to === "string" ? req.query.to : ""

  // Validate before the database sees them: a malformed date would be a 500.
  // Date.parse is lenient (it turns 2026-02-31 into March 3rd), so check the round trip.
  const valid = (d: string) => {
    if (!ISO_DATE.test(d)) return false
    const [y, m, day] = d.split("-").map(Number)
    const date = new Date(Date.UTC(y, m - 1, day))
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === day
  }
  if (!valid(from) || !valid(to) || from > to) {
    throw new AppError("Invalid date range", 400)
  }

  const slug = await getSlugFromOrganizationId(req.context!.organizationId)
  const data = await service.exportBookings(slug, from, to)

  const csvContent = toCsv([
    ["Date", "Start Time", "Status", "Client Name", "Client Email", "Service", "Price"],
    ...data.map((row) => [
      row.date,
      row.start_time,
      row.status,
      row.client_name,
      row.client_email,
      row.service_name,
      row.price,
    ]),
  ])

  res.setHeader("Content-Type", "text/csv")
  res.setHeader("Content-Disposition", "attachment; filename=bookings.csv")
  res.send(csvContent)
}
