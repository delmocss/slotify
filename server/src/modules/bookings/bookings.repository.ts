import { pool } from "../../config/db"

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

  async create(data: any) {
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
}
