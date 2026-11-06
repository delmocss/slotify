import { Pool } from "pg"
import { env } from "./env"

// A local Postgres (dev/test) has no SSL; any remote host (Supabase) does.
const isLocal = /@(localhost|127\.0\.0\.1)(:|\/|$)/.test(env.databaseUrl)

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: isLocal ? false : { rejectUnauthorized: false },
})
