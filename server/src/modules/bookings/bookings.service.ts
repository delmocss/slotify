import { pool } from "../../config/db"
import { BookingsRepository } from "./bookings.repository"
import { timeToMinutes } from "../availability/availability.utils"
import { AppError } from "../../utils/appError"

export class BookingsService {
  private repo = new BookingsRepository()

  async create(businessId: string, data: any) {
    const client = await pool.connect()

    try {
      await client.query("BEGIN")

      const today = new Date().toISOString().split("T")[0]

      if (data.date < today) {
        throw new AppError("Cannot book past dates", 400)
      }

      // Validar que no se reserve un slot que ya pasó (mismo día)
      if (data.date === today) {
        const now = new Date()
        const currentMinutes = now.getHours() * 60 + now.getMinutes()
        const slotMinutes = timeToMinutes(data.start_time)

        if (slotMinutes <= currentMinutes) {
          throw new AppError("Cannot book past time slots", 400)
        }
      }

      // 1️⃣ Obtener servicio
      const serviceResult = await client.query(
        `SELECT duration_minutes 
         FROM services 
         WHERE id = $1 AND business_id = $2`,
        [data.serviceId, businessId]
      )

      const service = serviceResult.rows[0]
      if (!service) throw new AppError("Service not found", 404)

      const duration = service.duration_minutes

      // 2️⃣ Calcular end_time
      const startMinutes = timeToMinutes(data.start_time)
      const endMinutes = startMinutes + duration

      const endTime = `${String(Math.floor(endMinutes / 60)).padStart(
        2,
        "0"
      )}:${String(endMinutes % 60).padStart(2, "0")}`

      // 3️⃣ Validar conflictos
      const conflicts = await client.query(
        `
        SELECT * FROM bookings
        WHERE business_id = $1
        AND service_id = $2
        AND date = $3
        AND status = 'confirmed'
        AND start_time < $5
        AND end_time > $4
        `,
        [
          businessId,
          data.serviceId,
          data.date,
          data.start_time,
          endTime,
        ]
      )

      if (conflicts.rows.length > 0) {
        throw new AppError("Slot already booked", 409)
      }

      const bookingCode = await this.generateBookingCode()

      // 4️⃣ Crear booking
      await client.query(
        `
        INSERT INTO bookings
        (business_id, service_id, client_name, client_email, date, start_time, end_time, booking_code)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *
        `,
        [
          businessId,
          data.serviceId,
          data.client_name,
          data.client_email,
          data.date,
          data.start_time,
          endTime,
          bookingCode,
        ]
      )

      await client.query("COMMIT")

      return {
        message: "Booking created",
        booking_code: bookingCode,
      }
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  async cancel(businessId: string, bookingId: string) {
  const result = await pool.query(
    `
    UPDATE bookings
    SET status = 'cancelled'
    WHERE id = $1 AND business_id = $2
    RETURNING *
    `,
    [bookingId, businessId]
  )

  if (!result.rows.length) {
    throw new AppError("Booking not found", 404)
  }

  return result.rows[0]
}

async getAll(businessId: string) {
  return this.repo.findAll(businessId)
}

async generateBookingCode() {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `SLT-${random}`
}



}
