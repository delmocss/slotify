import { z } from "zod"

export const MAX_DURATION_MINUTES = 1440
// services.price is NUMERIC(10,2); stay well below the overflow limit.
export const MAX_PRICE = 100000

export const createServiceSchema = z.object({
  name: z
    .string({ error: "Service name is required" })
    .trim()
    .min(2, "Service name must be at least 2 characters")
    .max(80, "Service name must be at most 80 characters"),
  duration_minutes: z
    .number({ error: "Duration must be a number" })
    .int("Duration must be a whole number of minutes")
    .min(1, "Duration must be at least 1 minute")
    .max(MAX_DURATION_MINUTES, "Duration cannot exceed 24 hours (1440 minutes)"),
  price: z
    .number({ error: "Price must be a number" })
    .min(0, "Price cannot be negative")
    .max(MAX_PRICE, `Price cannot exceed ${MAX_PRICE}`)
    .refine((value) => Math.round(value * 100) === Number((value * 100).toFixed(6)), {
      message: "Price can have at most 2 decimals",
    }),
})

export const updateServiceSchema = createServiceSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: "Nothing to update" })
