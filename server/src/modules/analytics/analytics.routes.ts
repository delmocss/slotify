import { Router } from "express"
import { exportBookings, getDashboardMetrics } from "./analytics.controller"
import { protect } from "../../middlewares/auth.middleware"

const router = Router()

router.get("/metrics", protect, getDashboardMetrics)

router.get("/export", protect, exportBookings)

export default router
