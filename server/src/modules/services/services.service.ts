import { ServicesRepository } from "./services.repository"
import { AppError } from "../../utils/appError"
import { pool } from "../../config/db"

interface CreateServiceData {
  name: string
  duration_minutes: number
  price: number
}

export class ServicesService {
  private repo = new ServicesRepository()

  async create(organizationId: string, data: CreateServiceData) {
    return this.repo.create({ businessId: organizationId, ...data })
  }

  async getAll(organizationId: string) {
    return this.repo.findAll(organizationId)
  }

  async update(id: string, organizationId: string, data: Partial<CreateServiceData>) {
    const service = await this.repo.update(id, organizationId, data)

    if (!service) {
      throw new AppError("Service not found", 404)
    }

    return service
  }

  async delete(id: string, organizationId: string) {
    await this.repo.delete(id, organizationId)
  }

  async toggleService(slug: string, organizationId: string) {
    const result = await pool.query(
      `
      UPDATE services
      SET is_active = NOT is_active
      WHERE slug = $1 AND business_id = $2
      RETURNING id, slug, is_active
      `,
      [slug, organizationId]
    )

    return result.rows[0]
  }
}
