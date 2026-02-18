import { api } from "../../../lib/axios"

export async function getBookings() {
  const res = await api.get("/bookings")
  return res.data
}

export async function cancelBooking(id: string) {
  const res = await api.patch(`/bookings/${id}/cancel`)
  return res.data
}

export async function getMetrics() {
  const res = await api.get("/analytics/metrics")
  return res.data
}

export async function exportBookings(from: string, to: string) {
  const response = await api.get("/analytics/export", {
    params: { from, to },
    responseType: "blob",
  })

  return response.data
}

