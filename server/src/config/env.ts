import dotenv from "dotenv"
import { z } from "zod"

dotenv.config()

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatoria"),
  // 32+ caracteres: un secreto corto o vacio hace triviales los JWT falsificados.
  JWT_SECRET: z.string().min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
  // Origenes permitidos por CORS, separados por comas (p. ej. el dominio de Vercel).
  CORS_ORIGIN: z.string().optional(),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  const problems = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`)
  console.error(`Configuracion de entorno invalida:\n${problems.join("\n")}`)
  process.exit(1)
}

const corsOrigins = parsed.data.CORS_ORIGIN
  ? parsed.data.CORS_ORIGIN.split(",").map((o) => o.trim().replace(/\/$/, "")).filter(Boolean)
  : null

if (!corsOrigins) {
  console.warn("CORS_ORIGIN no esta definida: se aceptan peticiones de cualquier origen. Defínela en produccion.")
}

export const env = {
  port: parsed.data.PORT,
  databaseUrl: parsed.data.DATABASE_URL,
  jwtSecret: parsed.data.JWT_SECRET,
  corsOrigins,
}
