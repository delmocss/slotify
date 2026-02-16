import express from "express"
import cors from "cors"
import authRoutes from "./modules/auth/auth.routes"


export const app = express()

app.use(cors())
app.use(express.json())
app.use("/auth", authRoutes)

app.get("/health", (_, res) => {
  res.json({ status: "ok" })
})
