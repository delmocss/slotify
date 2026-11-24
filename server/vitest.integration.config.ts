import { defineConfig } from "vitest/config"

// Integration tests run against a REAL Postgres (the schema is recreated from
// src/database/schema.sql, so point TEST_DATABASE_URL at a throwaway database):
//
//   docker run -d --name slotify-pg-test -e POSTGRES_PASSWORD=test -e POSTGRES_DB=slotify_test -p 55432:5432 postgres:16-alpine
//   TEST_DATABASE_URL=postgresql://postgres:test@localhost:55432/slotify_test npm run test:integration
const url = process.env.TEST_DATABASE_URL

if (!url) {
  throw new Error("TEST_DATABASE_URL is required to run the integration tests")
}
if (!/@(localhost|127\.0\.0\.1)(:|\/)/.test(url)) {
  // The suite drops and recreates the public schema: never let it near a remote database.
  throw new Error("TEST_DATABASE_URL must point to a local database")
}

export default defineConfig({
  test: {
    include: ["tests/integration/**/*.test.ts"],
    // One database, one schema: files must not run in parallel.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
    env: {
      DATABASE_URL: url,
      JWT_SECRET: "x".repeat(40),
      CORS_ORIGIN: "https://front.example.com",
      DEMO_EMAIL: "demo@demo.com",
      DEMO_SLUG: "demo-negocio",
    },
  },
})
