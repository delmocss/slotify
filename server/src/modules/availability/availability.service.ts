import { pool } from "../../config/db"
import {
  generateSlots,
  timeToMinutes,
  hasConflict,
} from "./availability.utils"
import { AppError } from "../../utils/appError"

export class AvailabilityService {
  async getAvailability(
    businessId: string,
    serviceId: string,
    date: string
  ) {
    // 1️⃣ Obtener servicio
    const serviceResult = await pool.query(
      "SELECT duration_minutes FROM services WHERE id = $1 AND business_id = $2",
      [serviceId, businessId]
    )

    const service = serviceResult.rows[0]
    if (!service) throw new AppError("Service not found", 404)

    const duration = service.duration_minutes

    // 2️⃣ Obtener día de la semana
    const dayOfWeek = new Date(date).getDay()

    // 3️⃣ Obtener working hours
    const workingResult = await pool.query(
      `SELECT start_time, end_time
       FROM working_hours
       WHERE business_id = $1 AND day_of_week = $2`,
      [businessId, dayOfWeek]
    )

    const workingHours = workingResult.rows

    if (!workingHours.length) {
      return []
    }

    // 4️⃣ Generar slots candidatos
    let candidateSlots: { start: string; end: string }[] = []

    for (const wh of workingHours) {
      const slots = generateSlots(
        wh.start_time,
        wh.end_time,
        duration
      )
      candidateSlots.push(...slots)
    }

    // 5️⃣ Obtener bookings existentes
    const bookingsResult = await pool.query(
      `SELECT start_time, end_time
       FROM bookings
       WHERE business_id = $1
       AND service_id = $2
       AND date = $3
       AND status = 'confirmed'`,
      [businessId, serviceId, date]
    )

    const bookings = bookingsResult.rows

    // 6️⃣ Filtrar conflictos
    const availableSlots = candidateSlots.filter(slot => {
      const slotStart = timeToMinutes(slot.start)
      const slotEnd = timeToMinutes(slot.end)

      for (const booking of bookings) {
        const bookingStart = timeToMinutes(booking.start_time)
        const bookingEnd = timeToMinutes(booking.end_time)

        if (hasConflict(slotStart, slotEnd, bookingStart, bookingEnd)) {
          return false
        }
      }

      return true
    })

    return availableSlots.map(slot => slot.start)
  }
}
