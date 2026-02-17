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
