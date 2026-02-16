import { Request, Response } from "express"
import { WorkingHoursService } from "./working-hours.service"

const service = new WorkingHoursService()

export async function updateWorkingHours(
  req: Request,
  res: Response
) {
  await service.update(req.businessId!, req.body)
  res.status(204).send()
}

export async function getWorkingHours(
  req: Request,
  res: Response
) {
  const result = await service.get(req.businessId!)
  res.json(result)
}
