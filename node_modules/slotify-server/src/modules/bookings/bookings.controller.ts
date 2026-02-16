import { Request, Response } from "express"
import { BookingsService } from "./bookings.service"

const service = new BookingsService()

export async function createBooking(
  req: Request,
  res: Response
) {
  const result = await service.create(req.businessId!, req.body)
  res.status(201).json(result)
}
