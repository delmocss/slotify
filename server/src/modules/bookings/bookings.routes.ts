import { Router } from "express"
import { validate } from "../../middlewares/validate.middleware"
import { createBooking } from "./bookings.controller"
import { createBookingSchema } from "./bookings.schema"
import { protect } from "../../middlewares/auth.middleware"

const router = Router()

router.post(
  "/",
  protect,
  validate(createBookingSchema),
  createBooking
)

export default router
