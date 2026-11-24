import { ServicesRepository, generateSlug } from "./services.repository"
import { AppError } from "../../utils/appError"

interface CreateServiceData {
  name: string
  duration_minutes: number
  price: number
}

const DUPLICATE_MESSAGE = "You already have a service with this name"

function isUniqueViolation(err: unknown) {
  return (err as { code?: string })?.code === "23505"
}

export class ServicesService {
  private repo = new ServicesRepository()

  async create(organizationId: string, data: CreateServiceData) {
    const slug = this.slugFor(data.name)

    if (await this.repo.slugExists(organizationId, slug)) {
      throw new AppError(DUPLICATE_MESSAGE, 409)
    }

    try {
      return await this.repo.create({ businessId: organizationId, slug, ...data })
    } catch (err) {
      // Lost a race with a concurrent request creating the same name.
      if (isUniqueViolation(err)) throw new AppError(DUPLICATE_MESSAGE, 409)
      throw err
    }
  }

  async getAll(organizationId: string) {
    return this.repo.findAll(organizationId)
  }

  async update(id: string, organizationId: string, data: Partial<CreateServiceData>) {
    const changes: Partial<CreateServiceData> & { slug?: string } = { ...data }

    // The slug is derived from the name, so renaming a service keeps them in sync.
    if (data.name !== undefined) {
      const slug = this.slugFor(data.name)
      if (await this.repo.slugExists(organizationId, slug, id)) {
        throw new AppError(DUPLICATE_MESSAGE, 409)
      }
      changes.slug = slug
    }

    let service
    try {
      service = await this.repo.update(id, organizationId, changes)
    } catch (err) {
      if (isUniqueViolation(err)) throw new AppError(DUPLICATE_MESSAGE, 409)
      throw err
    }

    if (!service) {
      throw new AppError("Service not found", 404)
    }

    return service
  }

  async delete(id: string, organizationId: string) {
    const deleted = await this.repo.delete(id, organizationId)
    if (!deleted) {
      throw new AppError("Service not found", 404)
    }
  }

  async toggleService(slug: string, organizationId: string) {
    const service = await this.repo.toggle(slug, organizationId)
    if (!service) {
      throw new AppError("Service not found", 404)
    }
    return service
  }

  private slugFor(name: string) {
    const slug = generateSlug(name)
    if (!slug) {
      throw new AppError("Service name must contain letters or numbers", 400)
    }
    return slug
  }
}
