import { Request, Response, NextFunction } from "express"
import { verifyAccessToken, JwtPayload } from "../utils/jwt.utils"
import { pool } from "../config/db"

export async function protect(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const token = authHeader.split(" ")[1]

  // 1. Verify JWT signature and expiry. Only a bad token is a 401.
  let payload: JwtPayload
  try {
    payload = verifyAccessToken(token)
  } catch {
    return res.status(401).json({ message: "Invalid token" })
  }

  // 2. Validate user has membership in organization. A database failure here is NOT an
  // authentication problem: let it reach the error handler as a 500 so clients do not
  // drop a valid session over a transient outage (Express 5 forwards async errors).
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
}
