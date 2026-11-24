import express from "express"
import cors from "cors"
import helmet from "helmet"
import { env } from "./config/env"
import { pool } from "./config/db"
import { apiLimiter, authLimiter, bookingLimiter } from "./middlewares/rate-limit.middleware"
import authRoutes from "./modules/auth/auth.routes"
import servicesRoutes from "./modules/services/services.routes"
import workingHoursRoutes from "./modules/working-hours/working-hours.routes"
import availabilityRoutes from "./modules/availability/availability.routes"
import bookingsRoutes from "./modules/bookings/bookings.routes"
import publicRoutes from "./modules/public/public.routes"
import { errorHandler } from "./middlewares/error.middleware"
import analyticsRoutes from "./modules/analytics/analytics.routes"

export const app = express()

// Render (y cualquier PaaS) pone un proxy delante: sin esto el limite de peticiones
// vería la IP del proxy para todos los clientes.
app.set("trust proxy", 1)

app.disable("x-powered-by")
app.use(helmet())
app.use(cors({ origin: env.corsOrigins ?? true }))
app.use(express.json({ limit: "100kb" }))

app.get("/health", (_, res) => {
  res.json({ status: "ok" })
})
app.use(apiLimiter)

// Touches the database (unlike /health). Used by the scheduled keep-alive workflow: the free
// Supabase tier pauses a project after 7 days without activity. Rate limited like the rest.
app.get("/health/db", async (_, res) => {
  try {
    await pool.query("SELECT 1")
    res.json({ status: "ok" })
  } catch (err) {
    console.error("Database health check failed", err)
    res.status(503).json({ status: "error" })
  }
})

app.use("/auth/login", authLimiter)
app.use("/auth/register", authLimiter)
app.use("/public/:slug/bookings", bookingLimiter)
app.use("/public/cancel", bookingLimiter)

app.use("/auth", authRoutes)
app.use("/services", servicesRoutes)
app.use("/working-hours", workingHoursRoutes)
app.use("/availability", availabilityRoutes)
app.use("/bookings", bookingsRoutes)
app.use("/public", publicRoutes)
app.use("/analytics", analyticsRoutes)

// Error handler must be last
app.use(errorHandler)
