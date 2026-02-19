import { WorkingHoursRepository } from "./working-hours.repository"

interface WorkingHoursInput {
  day_of_week: number
  start_time: string
  end_time: string
}

export class WorkingHoursService {
  private repo = new WorkingHoursRepository()

  async update(businessId: string, hours: WorkingHoursInput[]) {
    return this.repo.replaceAll(businessId, hours)
  }

  async get(businessId: string) {
    return this.repo.findByBusiness(businessId)
  }
}
