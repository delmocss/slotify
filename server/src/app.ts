import express from "express"
import cors from "cors"

export const app = express()
import { pool } from "./config/db"

app.get("/test-db", async (_, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows[0]);
});

app.use(cors())
app.use(express.json())

app.get("/health", (_, res) => {
  res.json({ status: "ok" })
})
