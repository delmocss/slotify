import { Request, Response } from "express"
import { AnalyticsService } from "./analytics.service"
import { pool } from "../../config/db"

const service = new AnalyticsService()

async function getSlugFromBusinessId(businessId: string): Promise<string> {
  const result = await pool.query(
    "SELECT slug FROM businesses WHERE id = $1",
    [businessId]
  )
  if (!result.rows.length) {
    throw new Error("Business not found")
  }
  return result.rows[0].slug
}

export async function getDashboardMetrics(
  req: Request,
  res: Response
) {
  try {
    const slug = await getSlugFromBusinessId(req.businessId!)
    const data = await service.getDashboardMetrics(slug)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}

export async function exportBookings(
  req: Request,
  res: Response
) {
  try {
    const slug = await getSlugFromBusinessId(req.businessId!)
    const { from, to } = req.query

    const data = await service.exportBookings(
      slug,
      from as string,
      to as string
    )

    const headers = [
      "Date",
      "Start Time",
      "Status",
      "Client Name",
      "Client Email",
      "Service",
      "Price",
    ]

    const rows = data.map((row) => [
      row.date,
      row.start_time,
      row.status,
      row.client_name,
      row.client_email,
      row.service_name,
      row.price,
    ])

    const csvContent =
      [headers, ...rows]
        .map((e) => e.join(","))
        .join("\n")

    res.setHeader("Content-Type", "text/csv")
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=bookings.csv"
    )

    res.send(csvContent)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}
