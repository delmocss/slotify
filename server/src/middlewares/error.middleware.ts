import { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/appError"

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    })
  }

  // Errores de body-parser (JSON mal formado, cuerpo demasiado grande...): son del cliente.
  if (isBodyParserError(err)) {
    return res.status(err.status).json({
      message: err.status === 413 ? "Payload too large" : "Invalid JSON body",
    })
  }

  console.error(err)

  return res.status(500).json({
    message: "Internal server error",
  })
}

function isBodyParserError(err: unknown): err is { status: 400 | 413; type: string } {
  if (typeof err !== "object" || err === null) return false
  const { status, type } = err as { status?: unknown; type?: unknown }
  return (
    (status === 400 || status === 413) && typeof type === "string" && type.startsWith("entity.")
  )
}
