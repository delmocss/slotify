import { z } from "zod"

export const workingHoursItemSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string(),
  end_time: z.string(),
})

export const updateWorkingHoursSchema = z.array(
  workingHoursItemSchema
)
