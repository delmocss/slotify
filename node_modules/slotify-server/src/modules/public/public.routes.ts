import { Router } from "express"
import {
  getPublicServices,
  getPublicAvailability,
  createPublicBooking,
} from "./public.controller"
import { validate } from "../../middlewares/validate.middleware"
import { createBookingSchema } from "../bookings/bookings.schema"

const router = Router()

router.get("/:slug/services", getPublicServices)

router.get("/:slug/availability", getPublicAvailability)

router.post(
  "/:slug/bookings",
  validate(createBookingSchema),
  createPublicBooking
)

export default router
