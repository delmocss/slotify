import { api } from "../../../lib/axios"

export async function getPublicServices(businessId: string) {
  const res = await api.get(`/public/${businessId}/services`)
  return res.data
}

export async function getAvailability(
  businessId: string,
  serviceId: string,
  date: string
) {
  const res = await api.get(
    `/public/${businessId}/availability`,
    { params: { serviceId, date } }
  )
  return res.data
}

export async function createBooking(
  businessId: string,
  data: any
) {
  const res = await api.post(
    `/public/${businessId}/bookings`,
    data
  )
  return res.data
}
