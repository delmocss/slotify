import { z } from "zod"

export const serviceSchema = z.object({
  name: z.string().min(2),
  duration_minutes: z.number().int().positive(),
  price: z.number().nonnegative(),
})

export type ServiceFormData = z.infer<typeof serviceSchema>
