import { Router } from "express"
import {
  getPublicServices,
  getPublicAvailability,
  createPublicBooking,
  getPublicBusiness,
  cancelPublicBooking,
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

router.get("/:slug", getPublicBusiness)

router.post("/cancel/:token", cancelPublicBooking)

export default router
