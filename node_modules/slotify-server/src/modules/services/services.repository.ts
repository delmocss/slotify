import { pool } from "../../config/db"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

export class ServicesRepository {
  async create(data: {
    businessId: string
    name: string
    duration_minutes: number
    price: number
  }) {
    const slug = generateSlug(data.name)
    
    const result = await pool.query(
      `INSERT INTO services (business_id, name, slug, duration_minutes, price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.businessId, data.name, slug, data.duration_minutes, data.price]
    )

    return result.rows[0]
  }

  async findAll(businessId: string) {
    const result = await pool.query(
      "SELECT * FROM services WHERE business_id = $1 ORDER BY created_at DESC",
      [businessId]
    )

    return result.rows
  }

  async update(id: string, businessId: string, data: Record<string, any>) {
    const fields = Object.keys(data)
    const values = Object.values(data)

    const setClause = fields
      .map((field, index) => `${field} = $${index + 3}`)
      .join(", ")

    const result = await pool.query(
      `UPDATE services
       SET ${setClause}
       WHERE id = $1 AND business_id = $2
       RETURNING *`,
      [id, businessId, ...values]
    )

    return result.rows[0]
  }

  async delete(id: string, businessId: string) {
    await pool.query(
      "DELETE FROM services WHERE id = $1 AND business_id = $2",
      [id, businessId]
    )
  }
}
