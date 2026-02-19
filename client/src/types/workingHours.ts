export interface WorkingHoursSlot {
  start_time: string
  end_time: string
}

export interface WorkingHoursDay {
  enabled: boolean
  slots: WorkingHoursSlot[]
}

export interface WorkingHours {
  id: string
  business_id: string
  day_of_week: number
  start_time: string
  end_time: string
}
