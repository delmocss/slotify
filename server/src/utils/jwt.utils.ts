import jwt from "jsonwebtoken"
import { env } from "../config/env"

export function generateToken(payload: { businessId: string }) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: "7d",
  })
}
