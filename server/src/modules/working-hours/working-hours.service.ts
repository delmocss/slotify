import { WorkingHoursRepository } from "./working-hours.repository"

interface WorkingHoursInput {
  day_of_week: number
  start_time: string
  end_time: string
}

export class WorkingHoursService {
  private repo = new WorkingHoursRepository()

  async update(organizationId: string, hours: WorkingHoursInput[]) {
    return this.repo.replaceAll(organizationId, hours)
  }

  async get(organizationId: string) {
    return this.repo.findByBusiness(organizationId)
  }
}
