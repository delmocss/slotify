import { pool } from "../../config/db"

interface BookingCreateData {
  businessId: string
  serviceId: string
  client_name: string
  client_email: string
  date: string
  start_time: string
  end_time: string
  booking_code: string
  cancel_token: string
}

export class BookingsRepository {
    async findConflicts(
        businessId: string,
        serviceId: string,
        date: string,
        startTime: string,
        endTime: string
    ) {
        const result = await pool.query(
            `
      SELECT * FROM bookings
      WHERE business_id = $1
      AND service_id = $2
      AND date = $3
      AND status = 'confirmed'
      AND start_time < $5
      AND end_time > $4
      `,
            [businessId, serviceId, date, startTime, endTime]
        )

        return result.rows
    }

    async create(data: BookingCreateData) {
        const result = await pool.query(
            `
      INSERT INTO bookings
      (business_id, service_id, client_name, client_email, date, start_time, end_time)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
            [
                data.businessId,
                data.serviceId,
                data.client_name,
                data.client_email,
                data.date,
                data.start_time,
                data.end_time,
            ]
        )

        return result.rows[0]
    }

    async findAll(businessId: string) {
        const result = await pool.query(
            `
    SELECT 
      b.id,
      TO_CHAR(b.date, 'YYYY-MM-DD') as date,
      b.start_time,
      b.status,
      b.client_name,
      s.name as service_name
    FROM bookings b
    JOIN services s ON s.id = b.service_id
    WHERE b.business_id = $1
    ORDER BY b.date DESC, b.start_time DESC
    `,
            [businessId]
        )

        return result.rows
    }

}


