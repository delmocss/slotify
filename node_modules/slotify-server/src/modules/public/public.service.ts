import { pool } from "../../config/db"
import { AvailabilityService } from "../availability/availability.service"
import { BookingsService } from "../bookings/bookings.service"

export class PublicService {
  private availabilityService = new AvailabilityService()
  private bookingsService = new BookingsService()

  async getServices(businessId: string) {
    const result = await pool.query(
      `SELECT id, name, duration_minutes, price
       FROM services
       WHERE business_id = $1
       ORDER BY created_at DESC`,
      [businessId]
    )

    return result.rows
  }

  async getAvailability(
    businessId: string,
    serviceId: string,
    date: string
  ) {
    return this.availabilityService.getAvailability(
      businessId,
      serviceId,
      date
    )
  }

  async createBooking(businessId: string, data: any) {
    return this.bookingsService.create(businessId, data)
  }
}
