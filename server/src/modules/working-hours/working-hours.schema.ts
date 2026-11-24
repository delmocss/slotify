import { z } from "zod"

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Use the HH:MM time format")

export const workingHoursItemSchema = z
  .object({
    day_of_week: z.number().int().min(0).max(6),
    start_time: time,
    end_time: time,
  })
  .refine((item) => item.start_time.slice(0, 5) < item.end_time.slice(0, 5), {
    message: "End time must be after start time",
  })

export const updateWorkingHoursSchema = z.array(workingHoursItemSchema)
