import { Request, Response } from "express"
import { AnalyticsService } from "./analytics.service"

const service = new AnalyticsService()

export async function getDashboardMetrics(
  req: Request,
  res: Response
) {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug
  const data = await service.getDashboardMetrics(slug)
  res.json(data)
}

export async function exportBookings(
  req: Request,
  res: Response
) {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug
  const { from, to } = req.query

  const data = await service.exportBookings(
    slug,
    from as string,
    to as string
  )

  // Convert to CSV
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
}
