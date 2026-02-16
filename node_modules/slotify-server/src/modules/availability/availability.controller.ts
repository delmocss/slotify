import { Request, Response } from "express"
import { AvailabilityService } from "./availability.service"

const service = new AvailabilityService()

export async function getAvailability(
  req: Request,
  res: Response
) {
  const { serviceId, date } = req.query

  const result = await service.getAvailability(
    req.businessId!,
    serviceId as string,
    date as string
  )

  res.json({
    date,
    slots: result,
  })
}
