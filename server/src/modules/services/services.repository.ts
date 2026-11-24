import { pool } from "../../config/db"

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

// Only these columns can ever be written by update(); anything else is ignored.
const UPDATABLE_FIELDS = ["name", "slug", "duration_minutes", "price"] as const

export class ServicesRepository {
  async create(data: {
    businessId: string
    name: string
    slug: string
    duration_minutes: number
    price: number
  }) {
    const result = await pool.query(
      `INSERT INTO services (business_id, name, slug, duration_minutes, price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.businessId, data.name, data.slug, data.duration_minutes, data.price]
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

  async update(
    id: string,
    businessId: string,
    data: Partial<{ name: string; slug: string; duration_minutes: number; price: number }>
  ) {
    const fields = UPDATABLE_FIELDS.filter((field) => data[field] !== undefined)
    if (!fields.length) return undefined

    const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(", ")
    const values = fields.map((field) => data[field])

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
    const result = await pool.query("DELETE FROM services WHERE id = $1 AND business_id = $2", [
      id,
      businessId,
    ])
    return (result.rowCount ?? 0) > 0
  }

  async toggle(slug: string, businessId: string) {
    const result = await pool.query(
      `UPDATE services
       SET is_active = NOT is_active
       WHERE slug = $1 AND business_id = $2
       RETURNING *`,
      [slug, businessId]
    )
    return result.rows[0]
  }

  async slugExists(businessId: string, slug: string, excludeId?: string) {
    const result = await pool.query(
      "SELECT 1 FROM services WHERE business_id = $1 AND slug = $2 AND ($3::uuid IS NULL OR id <> $3)",
      [businessId, slug, excludeId ?? null]
    )
    return result.rows.length > 0
  }
}
