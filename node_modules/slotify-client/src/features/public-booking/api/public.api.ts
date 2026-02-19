import { api } from "../../../lib/axios"
import { CreateBookingRequest } from "@/types"

export async function getPublicServices(slug: string) {
    const response = await api.get(`/public/${slug}/services`)
    return response.data
}

export async function getPublicBusiness(slug: string) {
    const response = await api.get(`/public/${slug}`)
    return response.data
}

export async function getAvailability(
    slug: string,
    serviceId: string,
    date: string
) {
    const response = await api.get(`/public/${slug}/availability`, { params: { serviceId, date } })
    return response.data
}

export async function createBooking(slug: string, data: CreateBookingRequest) {
    const response = await api.post(`/public/${slug}/bookings`, data)
    return response.data
}


