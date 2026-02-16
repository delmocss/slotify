import { z } from "zod"

export const createBookingSchema = z.object({
  serviceId: z.string().uuid(),
  date: z.string(),
  start_time: z.string(),
  client_name: z.string().min(2),
  client_email: z.string().email(),
})
