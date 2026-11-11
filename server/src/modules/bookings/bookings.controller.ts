import { Request, Response } from "express"
import { BookingsService } from "./bookings.service"

const service = new BookingsService()

export async function createBooking(req: Request, res: Response) {
  const result = await service.create(req.context!.organizationId, req.body)
  res.status(201).json(result)
}

export async function cancelBooking(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const result = await service.cancel(req.context!.organizationId, id)

  res.json(result)
}

export async function getBookings(req: Request, res: Response) {
  const result = await service.getAll(req.context!.organizationId)
  res.json(result)
}
