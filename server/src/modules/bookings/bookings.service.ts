import { pool } from "../../config/db"
import { BookingsRepository } from "./bookings.repository"
import { timeToMinutes } from "../availability/availability.utils"
import { AppError } from "../../utils/appError"
import crypto from "crypto"

interface CreateBookingData {
  serviceId: string
  date: string
  start_time: string
  client_name: string
  client_email: string
}

export class BookingsService {
  private repo = new BookingsRepository()

  async create(organizationId: string, data: CreateBookingData) {
    const client = await pool.connect()

    try {
      await client.query("BEGIN")

      // Serializa las reservas del mismo negocio, servicio y dia: sin este lock,
      // dos peticiones simultaneas pasan ambas la comprobacion de conflicto de mas
      // abajo (ninguna ve aun la reserva de la otra) y reservan el mismo hueco.
      // El lock se libera solo al terminar la transaccion (COMMIT/ROLLBACK).
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        `${organizationId}:${data.serviceId}:${data.date}`,
      ])

      const today = new Date().toISOString().split("T")[0]

      if (data.date < today) {
        throw new AppError("Cannot book past dates", 400)
      }

      if (data.date === today) {
        const now = new Date()
        const currentMinutes = now.getHours() * 60 + now.getMinutes()
        const slotMinutes = timeToMinutes(data.start_time)

        if (slotMinutes <= currentMinutes) {
          throw new AppError("Cannot book past time slots", 400)
        }
      }

      const serviceResult = await client.query(
        `SELECT duration_minutes 
         FROM services 
         WHERE id = $1 AND business_id = $2`,
        [data.serviceId, organizationId]
      )

      const service = serviceResult.rows[0]
      if (!service) throw new AppError("Service not found", 404)

      const duration = service.duration_minutes

      const startMinutes = timeToMinutes(data.start_time)
      const endMinutes = startMinutes + duration

      const endTime = `${String(Math.floor(endMinutes / 60)).padStart(
        2,
        "0"
      )}:${String(endMinutes % 60).padStart(2, "0")}`

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
        [organizationId, data.serviceId, data.date, data.start_time, endTime]
      )

      if (conflicts.rows.length > 0) {
        throw new AppError("Slot already booked", 409)
      }

      const bookingCode = await this.generateBookingCode()
      const cancelToken = await this.generateCancelToken()

      await client.query(
        `
        INSERT INTO bookings
        (business_id, service_id, client_name, client_email, date, start_time, end_time, booking_code, cancel_token)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *
        `,
        [
          organizationId,
          data.serviceId,
          data.client_name,
          data.client_email,
          data.date,
          data.start_time,
          endTime,
          bookingCode,
          cancelToken,
        ]
      )

      await client.query("COMMIT")

      return {
        message: "Booking created",
        booking_code: bookingCode,
        cancel_token: cancelToken,
      }
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  async cancel(organizationId: string, bookingId: string) {
    const result = await pool.query(
      `
      UPDATE bookings
      SET status = 'cancelled'
      WHERE id = $1 AND business_id = $2
      RETURNING *
      `,
      [bookingId, organizationId]
    )

    if (!result.rows.length) {
      throw new AppError("Booking not found", 404)
    }

    return result.rows[0]
  }

  async getAll(organizationId: string) {
    return this.repo.findAll(organizationId)
  }

  async generateBookingCode() {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `SLT-${random}`
  }

  async generateCancelToken() {
    return crypto.randomBytes(24).toString("hex")
  }

  async cancelBookingByToken(token: string) {
    const result = await pool.query(
      `
    UPDATE bookings
    SET status = 'cancelled'
    WHERE cancel_token = $1
      AND status = 'confirmed'
    RETURNING booking_code
    `,
      [token]
    )

    if (!result.rows.length) {
      throw new Error("Invalid or already cancelled booking")
    }

    return result.rows[0]
  }
}
