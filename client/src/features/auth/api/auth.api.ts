import { api } from "../../../lib/axios"

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

export async function getMe() {
  const res = await api.get("/auth/me")
  return res.data
}
