import express from "express"
import cors from "cors"
import authRoutes from "./modules/auth/auth.routes"
import servicesRoutes from "./modules/services/services.routes"



export const app = express()

app.use(cors())
app.use(express.json())
app.use("/auth", authRoutes)
app.use("/services", servicesRoutes)

app.get("/health", (_, res) => {
  res.json({ status: "ok" })
})
