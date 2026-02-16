import { api } from "../../../lib/axios"

export async function getWorkingHours() {
  const res = await api.get("/working-hours")
  return res.data
}

export async function updateWorkingHours(data: any[]) {
  await api.put("/working-hours", data)
}
