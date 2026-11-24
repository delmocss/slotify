import { Request, Response, NextFunction } from "express"
import { ZodSchema } from "zod"

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }))
      return res.status(400).json({
        message: errors[0]?.message ?? "Invalid request",
        errors,
      })
    }

    // Replace the body with the parsed data: zod strips unknown keys, so handlers
    // (and any SQL built from the body) only ever see the fields in the schema.
    req.body = result.data

    next()
  }
}
