import { Router } from "express"
import { getDashboardMetrics } from "./analytics.controller"
import { protect } from "../../middlewares/auth.middleware"

const router = Router()

router.get("/metrics", protect, getDashboardMetrics)

export default router
