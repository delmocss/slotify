import { api } from "../../../lib/axios"

export async function getServices() {
  const res = await api.get("/services")
  return res.data
}

export async function createService(data: any) {
  const res = await api.post("/services", data)
  return res.data
}

export async function deleteService(id: string) {
  await api.delete(`/services/${id}`)
}
