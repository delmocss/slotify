import { Request, Response } from "express"
import { PublicService } from "./public.service"

const service = new PublicService()

export async function getPublicServices(
  req: Request,
  res: Response
) {
  const businessId = Array.isArray(req.params.businessId)
    ? req.params.businessId[0]
    : req.params.businessId

  const result = await service.getServices(businessId)

  res.json(result)
}

export async function getPublicAvailability(
  req: Request,
  res: Response
) {
  const businessId = Array.isArray(req.params.businessId)
    ? req.params.businessId[0]
    : req.params.businessId
  const serviceId = Array.isArray(req.query.serviceId)
    ? req.query.serviceId[0]
    : req.query.serviceId
  const date = Array.isArray(req.query.date)
    ? req.query.date[0]
    : req.query.date

  const slots = await service.getAvailability(
    businessId,
    serviceId as string,
    date as string
  )

  res.json({ date, slots })
}

export async function createPublicBooking(
  req: Request,
  res: Response
) {
  const businessId = Array.isArray(req.params.businessId)
    ? req.params.businessId[0]
    : req.params.businessId

  const result = await service.createBooking(
    businessId,
    req.body
  )

  res.status(201).json(result)
}
