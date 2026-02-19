import { api } from "../../../lib/axios"

interface WorkingHoursUpdate {
  day_of_week: number
  start_time: string
  end_time: string
}

export async function getWorkingHours() {
  const res = await api.get("/working-hours")
  return res.data
}

export async function updateWorkingHours(data: WorkingHoursUpdate[]) {
  await api.put("/working-hours", data)
}
