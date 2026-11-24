import { z } from "zod"

// Keep these limits in sync with server/src/modules/services/services.schema.ts.
export const MAX_DURATION_MINUTES = 1440
export const MAX_PRICE = 100000

export const serviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Service name must be at least 2 characters")
    .max(80, "Service name must be at most 80 characters")
    .refine((value) => /[a-z0-9]/i.test(value), "Service name must contain letters or numbers"),
  duration_minutes: z
    .number({ error: "Enter the duration in minutes" })
    .int("Duration must be a whole number of minutes")
    .min(1, "Duration must be at least 1 minute")
    .max(MAX_DURATION_MINUTES, "Duration cannot exceed 24 hours (1440 minutes)"),
  price: z
    .number({ error: "Enter a price (use 0 for free)" })
    .min(0, "Price cannot be negative")
    .max(MAX_PRICE, `Price cannot exceed ${MAX_PRICE.toLocaleString("en-US")}`)
    .refine(
      (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6,
      "Price can have at most 2 decimals"
    ),
})

export type ServiceFormData = z.infer<typeof serviceSchema>
