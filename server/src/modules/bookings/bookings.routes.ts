import { Router } from "express"
import { validate } from "../../middlewares/validate.middleware"
import { cancelBooking, createBooking } from "./bookings.controller"
import { createBookingSchema } from "./bookings.schema"
import { protect } from "../../middlewares/auth.middleware"

const router = Router()

router.post(
  "/",
  protect,
  validate(createBookingSchema),
  createBooking
)

router.patch("/:id/cancel", protect, cancelBooking)


export default router
