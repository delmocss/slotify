import { ServicesRepository } from "./services.repository"
import { AppError } from "../../utils/appError"

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
}
