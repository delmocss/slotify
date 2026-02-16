import { WorkingHoursRepository } from "./working-hours.repository"

export class WorkingHoursService {
  private repo = new WorkingHoursRepository()

  async update(businessId: string, hours: any[]) {
    return this.repo.replaceAll(businessId, hours)
  }

  async get(businessId: string) {
    return this.repo.findByBusiness(businessId)
  }
}
