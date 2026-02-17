import express from "express"
import cors from "cors"
import authRoutes from "./modules/auth/auth.routes"
import servicesRoutes from "./modules/services/services.routes"
import workingHoursRoutes from "./modules/working-hours/working-hours.routes"
import availabilityRoutes from "./modules/availability/availability.routes"
import bookingsRoutes from "./modules/bookings/bookings.routes"
import publicRoutes from "./modules/public/public.routes"
import { errorHandler } from "./middlewares/error.middleware"
import analyticsRoutes from "./modules/analytics/analytics.routes"

export const app = express()

app.use(cors())
app.use(express.json())
app.use("/auth", authRoutes)
app.use("/services", servicesRoutes)
app.use("/working-hours", workingHoursRoutes)
app.use("/availability", availabilityRoutes)
app.use("/bookings", bookingsRoutes)
app.use("/public", publicRoutes)
app.use("/analytics", analyticsRoutes)
app.use(errorHandler)
app.get("/health", (_, res) => {
  res.json({ status: "ok" })
})
