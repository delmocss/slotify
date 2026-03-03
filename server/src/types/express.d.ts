import { Request } from "express"
import type { JwtPayload } from "../utils/jwt.utils"

type AuthRole = JwtPayload["role"]

declare module "express-serve-static-core" {
  interface Request {
    context?: {
      userId: string
      organizationId: string
      role: AuthRole
    }
  }
}
