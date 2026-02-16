import { pool } from "../../config/db"
import { AppError } from "../../utils/appError"
import { AvailabilityService } from "../availability/availability.service"
import { BookingsService } from "../bookings/bookings.service"

export class PublicService {
    private availabilityService = new AvailabilityService()
    private bookingsService = new BookingsService()

    async getServices(slug: string) {
        const business = await this.getBusinessBySlug(slug)

        const result = await pool.query(
            `SELECT id, name, duration_minutes, price
     FROM services
     WHERE business_id = $1`,
            [business.id]
        )

        return result.rows
    }


    async getAvailability(
        slug: string,
        serviceId: string,
        date: string
    ) {
        const business = await this.getBusinessBySlug(slug)

        return this.availabilityService.getAvailability(
            business.id, // ✅ UUID real
            serviceId,
            date
        )
    }


    async createBooking(slug: string, data: any) {
        const business = await this.getBusinessBySlug(slug)

        return this.bookingsService.create(
            business.id,   // 👈 UUID real
            data
        )
    }


    async getBusinessBySlug(slug: string) {
        const result = await pool.query(
            "SELECT id FROM businesses WHERE slug = $1",
            [slug]
        )

        if (!result.rows.length) {
            throw new AppError("Business not found", 404)
        }

        return result.rows[0] // { id: 'uuid' }
    }


}
