import { api } from "../../../lib/axios"
import type { MeResponse } from "@/types"

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  name: string
  email: string
  password: string
}

export async function login(data: LoginRequest) {
  const res = await api.post("/auth/login", data)
  return res.data
}

export async function register(data: RegisterRequest) {
  const res = await api.post("/auth/register", data)
  return res.data
}

export async function getMe(): Promise<MeResponse> {
  const res = await api.get<MeResponse>("/auth/me")
  return res.data
}
