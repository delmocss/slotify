import { pool } from "../../config/db"

interface WorkingHoursInput {
  day_of_week: number
  start_time: string
  end_time: string
}

export class WorkingHoursRepository {
  async replaceAll(businessId: string, hours: WorkingHoursInput[]) {
    await pool.query(
      "DELETE FROM working_hours WHERE business_id = $1",
      [businessId]
    )

    for (const item of hours) {
      await pool.query(
        `INSERT INTO working_hours 
         (business_id, day_of_week, start_time, end_time)
         VALUES ($1, $2, $3, $4)`,
        [
          businessId,
          item.day_of_week,
          item.start_time,
          item.end_time,
        ]
      )
    }
  }

  async findByBusiness(businessId: string) {
    const result = await pool.query(
      `SELECT * FROM working_hours
       WHERE business_id = $1
       ORDER BY day_of_week ASC, start_time ASC`,
      [businessId]
    )

    return result.rows
  }
}
