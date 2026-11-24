import { api } from "../../../lib/axios"
import { CreateServiceRequest, Service } from "@/types"

export async function getServices(): Promise<Service[]> {
  const res = await api.get<Service[]>("/services")
  return res.data
}

export async function createService(data: CreateServiceRequest): Promise<Service> {
  const res = await api.post<Service>("/services", data)
  return res.data
}

export async function updateService(id: string, data: Partial<CreateServiceRequest>) {
  const res = await api.put<Service>(`/services/${id}`, data)
  return res.data
}

export async function deleteService(id: string) {
  await api.delete(`/services/${id}`)
}

export async function toggleService(slug: string) {
  const res = await api.patch<Service>(`/services/${slug}/toggle`)
  return res.data
}
