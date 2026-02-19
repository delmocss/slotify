export type BookingStatus = "confirmed" | "cancelled"

export interface Booking {
  id: string
  business_id: string
  service_id: string
  booking_code: string
  cancel_token: string
  client_name: string
  client_email: string
  date: string
  start_time: string
  end_time: string
  status: BookingStatus
  created_at: string
  service_name?: string
}

export interface CreateBookingRequest {
  serviceId: string
  date: string
  start_time: string
  client_name: string
  client_email: string
}

export interface CreateBookingResponse {
  message: string
  booking_code: string
  cancel_token: string
}
