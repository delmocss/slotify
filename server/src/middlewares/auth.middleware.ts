import { Request, Response, NextFunction } from "express"
import { verifyAccessToken } from "../utils/jwt.utils"
import { pool } from "../config/db"

export async function protect(
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
    // 1. Verify JWT signature and decode
    const payload = verifyAccessToken(token)

    // 2. Validate user has membership in organization
    const result = await pool.query(
      `SELECT id, role FROM organization_members
       WHERE user_id = $1 AND organization_id = $2`,
      [payload.sub, payload.org]
    )

    if (!result.rows.length) {
      return res.status(403).json({ message: "Forbidden: Invalid organization" })
    }

    const membership = result.rows[0]

    // 3. Set context with validated data
    req.context = {
      userId: payload.sub,
      organizationId: payload.org,
      role: membership.role, // Use role from DB, not token (token can be stale)
    }

    next()
  } catch {
    return res.status(401).json({ message: "Invalid token" })
  }
}
