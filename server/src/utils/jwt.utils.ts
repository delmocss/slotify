import jwt from "jsonwebtoken"
import { env } from "../config/env"

export interface JwtPayload {
  sub: string
  org: string
  role: "owner" | "admin" | "member"
}

interface LegacyJwtPayload {
  businessId: string
}

export function generateAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: "15m",
  })
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload | LegacyJwtPayload

  if ("businessId" in decoded) {
    return {
      sub: decoded.businessId,
      org: decoded.businessId,
      role: "owner",
    }
  }

  return decoded
}

export function generateToken(payload: { businessId: string }) {
  return generateAccessToken({
    sub: payload.businessId,
    org: payload.businessId,
    role: "owner",
  })
}
