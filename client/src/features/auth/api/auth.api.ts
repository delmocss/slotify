import { api } from "../../../lib/axios"

export async function login(data: any) {
  const res = await api.post("/auth/login", data)
  return res.data
}

export async function register(data: any) {
  const res = await api.post("/auth/register", data)
  return res.data
}

export async function getMe() {
  const res = await api.get("/auth/me")
  return res.data
}
