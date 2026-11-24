import jwt from "jsonwebtoken"
import { describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  sqls: [] as string[],
  templateExists: true,
}))

vi.mock("../src/config/db", () => {
  const query = async (sql: string, params: unknown[] = []) => {
    state.sqls.push(sql.trim().replace(/\s+/g, " "))
    if (sql.includes("FROM users WHERE email")) {
      return {
        rows: [{ id: "demo-user", email: "demo@demo.com", password_hash: "hash", ...{ params } }],
      }
    }
    if (sql.includes("FROM businesses WHERE slug")) {
      return { rows: state.templateExists ? [{ id: "tpl", name: "Demo Negocio" }] : [] }
    }
    if (sql.includes("GREATEST")) return { rows: [{ days: 3 }] }
    if (sql.includes("COUNT(*)")) return { rows: [{ n: 0 }] }
    if (sql.includes("INSERT INTO users")) return { rows: [{ id: "u-sb", email: params[0] }] }
    if (sql.includes("INSERT INTO organizations"))
      return { rows: [{ id: "o-sb", name: params[0] }] }
    if (sql.includes("INSERT INTO businesses"))
      return { rows: [{ id: params[0], slug: params[3] }] }
    if (sql.includes("INSERT INTO services")) return { rows: [{ id: "new-svc" }] }
    if (sql.includes("FROM services WHERE business_id")) {
      return {
        rows: [
          {
            id: "old-svc",
            name: "Corte",
            slug: "corte",
            duration_minutes: 30,
            price: 10,
            is_active: true,
          },
        ],
      }
    }
    if (sql.includes("FROM bookings WHERE business_id")) {
      return {
        rows: [
          {
            service_id: "old-svc",
            client_name: "Ana",
            client_email: "a@b.com",
            date: "2026-01-01",
            start_time: "10:00",
            end_time: "10:30",
            status: "confirmed",
          },
        ],
      }
    }
    return { rows: [] }
  }
  const client = { query, release: vi.fn() }
  return { pool: { query, connect: async () => client } }
})

import { AuthService } from "../src/modules/auth/auth.service"
import { isSandboxEmail } from "../src/modules/auth/demo-sandbox.service"

vi.mock("../src/utils/hash.utils", () => ({
  hashPassword: async () => "hash",
  comparePassword: async () => true,
}))

describe("login de la cuenta demo (sandbox)", () => {
  it("entrega una copia privada en vez de los datos compartidos", async () => {
    state.sqls.length = 0
    const res = await new AuthService().login({ email: "demo@demo.com", password: "demo1234" })

    expect(res.sandbox).toBe(true)
    expect(res.user.email).toMatch(/^sandbox-.+@sandbox\.slotify\.local$/)
    expect(res.business.slug).toMatch(/^demo-negocio-[0-9a-f]{6}$/)
    expect(res.token).toBeTruthy()
    // the token must not outlive the sandbox (24h), unlike a normal 7-day session
    const { exp, iat } = jwt.decode(res.token) as { exp: number; iat: number }
    expect(exp - iat).toBe(24 * 3600)
    expect(state.sqls).toContain("BEGIN")
    expect(state.sqls).toContain("COMMIT")
    // servicios, horarios y reservas se copian al sandbox
    expect(state.sqls.some((s) => s.startsWith("INSERT INTO services"))).toBe(true)
    expect(state.sqls.some((s) => s.startsWith("INSERT INTO working_hours"))).toBe(true)
    expect(state.sqls.some((s) => s.includes("INSERT INTO bookings"))).toBe(true)
    // the date shift is computed in SQL, not by trusting JS dates
    expect(state.sqls.some((s) => s.includes("GREATEST(0, CURRENT_DATE - MAX(date))"))).toBe(true)
  })

  it("distingue emails de sandbox", () => {
    expect(isSandboxEmail("sandbox-ab@sandbox.slotify.local")).toBe(true)
    expect(isSandboxEmail("demo@demo.com")).toBe(false)
    expect(isSandboxEmail(undefined)).toBe(false)
  })
})
