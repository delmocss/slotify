import { Router } from "express"
import {
  getPublicServices,
  getPublicAvailability,
  createPublicBooking,
} from "./public.controller"
import { validate } from "../../middlewares/validate.middleware"
import { createBookingSchema } from "../bookings/bookings.schema"

const router = Router()

router.get("/:businessId/services", getPublicServices)

router.get("/:businessId/availability", getPublicAvailability)

router.post(
  "/:businessId/bookings",
  validate(createBookingSchema),
  createPublicBooking
)

export default router
