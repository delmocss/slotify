import { z } from "zod"

// Messages are shown to users (the client translates the known ones): keep them stable.
const email = z.string().email("Invalid email address")
const password = z.string().min(6, "Password must be at least 6 characters")

export const registerSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  email,
  password,
})

export const loginSchema = z.object({
  email,
  password,
})
