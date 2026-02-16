import { z } from "zod"

export const createServiceSchema = z.object({
  name: z.string().min(2),
  duration_minutes: z.number().int().positive(),
  price: z.number().nonnegative(),
})

export const updateServiceSchema = createServiceSchema.partial()
