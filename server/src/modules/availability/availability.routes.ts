import { Router } from "express"
import { protect } from "../../middlewares/auth.middleware"
import { getAvailability } from "./availability.controller"

const router = Router()

router.use(protect)

router.get("/", getAvailability)

export default router
