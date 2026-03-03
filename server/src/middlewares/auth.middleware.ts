import { Request, Response, NextFunction } from "express"
import { verifyAccessToken } from "../utils/jwt.utils"

export function protect(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const token = authHeader.split(" ")[1]

  try {
    const payload = verifyAccessToken(token)

    req.context = {
      userId: payload.sub,
      organizationId: payload.org,
      role: payload.role,
    }

    next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" })
  }
}
