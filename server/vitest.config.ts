import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    env: {
      // La app valida el entorno al importarse; el pool de pg es perezoso, asi que
      // estos tests no necesitan una base de datos real.
      DATABASE_URL: "postgresql://test:test@localhost:1/test",
      JWT_SECRET: "x".repeat(40),
      CORS_ORIGIN: "https://front.example.com",
    },
  },
})
