import { ServicesRepository } from "./services.repository"
import { AppError } from "../../utils/appError"
import { pool } from "../../config/db"

export class ServicesService {
  private repo = new ServicesRepository()

  async create(businessId: string, data: any) {
    return this.repo.create({ businessId, ...data })
  }

  async getAll(businessId: string) {
    return this.repo.findAll(businessId)
  }

  async update(id: string, businessId: string, data: any) {
    const service = await this.repo.update(id, businessId, data)

    if (!service) {
      throw new AppError("Service not found", 404)
    }

    return service
  }

  async delete(id: string, businessId: string) {
    await this.repo.delete(id, businessId)
  }

  async toggleService(
  slug: string,
  businessId: string
) {
  const result = await pool.query(
    `
    UPDATE services
    SET is_active = NOT is_active
    WHERE slug = $1 AND business_id = $2
    RETURNING id, slug, is_active
    `,
    [slug, businessId]
  )

  return result.rows[0]
}

}
