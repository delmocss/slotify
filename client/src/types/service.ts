export interface Service {
  id: string
  business_id: string
  name: string
  slug: string
  duration_minutes: number
  price: number
  is_active: boolean
  created_at: string
}

export interface CreateServiceRequest {
  name: string
  duration_minutes: number
  price: number
}
