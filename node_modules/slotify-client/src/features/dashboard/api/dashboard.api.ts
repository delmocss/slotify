import { api } from "../../../lib/axios"

export async function getBookings() {
  const res = await api.get("/bookings")
  return res.data
}

export async function cancelBooking(id: string) {
  const res = await api.patch(`/bookings/${id}/cancel`)
  return res.data
}
