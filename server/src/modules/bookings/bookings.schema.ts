import { z } from "zod"

export const createBookingSchema = z.object({
  serviceId: z.string().uuid("Invalid service"),
  date: z.string(),
  start_time: z.string(),
  client_name: z.string().min(2, "Name must be at least 2 characters"),
  client_email: z.string().email("Invalid email address"),
})
