import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  slugs: new Set<string>(),
  calls: [] as string[],
  failOn: null as string | null,
}))

vi.mock("../src/config/db", () => {
  const query = async (sql: string, params: unknown[] = []) => {
    const op = sql.trim().split(/\s+/).slice(0, 3).join(" ")
    state.calls.push(op)
    if (state.failOn && sql.includes(state.failOn)) {
      throw Object.assign(new Error("duplicate key"), { code: "23505" })
    }
    if (sql.startsWith("SELECT 1 FROM businesses")) {
      return { rows: state.slugs.has(params[0] as string) ? [{}] : [] }
    }
    if (sql.includes("FROM users WHERE email")) return { rows: [] }
    if (sql.includes("INTO users")) return { rows: [{ id: "u1", email: params[0] }] }
    if (sql.includes("INTO organizations")) return { rows: [{ id: "o1", name: params[0] }] }
    if (sql.includes("INTO organization_members")) return { rows: [{}] }
    if (sql.includes("INTO businesses")) {
      state.slugs.add(params[3] as string)
      return { rows: [{ id: params[0], slug: params[3] }] }
    }
    return { rows: [] }
  }
  const client = { query, release: vi.fn() }
  return { pool: { query, connect: async () => client } }
})

import { AuthService } from "../src/modules/auth/auth.service"

const input = (name: string) => ({ name, email: "a@b.com", password: "secret123" })

describe("register (transaccional)", () => {
  beforeEach(() => {
    state.slugs.clear()
    state.calls.length = 0
    state.failOn = null
  })

  it("crea todo dentro de BEGIN/COMMIT", async () => {
    const res = await new AuthService().register(input("Studio Aurora"))
    expect(res.business.slug).toBe("studio-aurora")
    expect(state.calls).toContain("BEGIN")
    expect(state.calls.indexOf("BEGIN")).toBeLessThan(state.calls.findIndex((c) => c.startsWith("INSERT INTO users")))
    expect(state.calls.at(-1)).toBe("COMMIT")
  })

  it("dos negocios con el mismo nombre obtienen slugs distintos", async () => {
    const svc = new AuthService()
    const a = await svc.register(input("Studio Aurora"))
    const b = await svc.register(input("Studio Aurora"))
    expect(a.business.slug).toBe("studio-aurora")
    expect(b.business.slug).toBe("studio-aurora-2")
  })

  it("un nombre sin caracteres validos usa el slug de reserva", async () => {
    const res = await new AuthService().register(input("***"))
    expect(res.business.slug).toBe("business")
  })

  it("si falla un INSERT hace ROLLBACK y no deja COMMIT", async () => {
    state.failOn = "INTO businesses"
    await expect(new AuthService().register(input("X Studio"))).rejects.toMatchObject({
      statusCode: 409,
    })
    expect(state.calls).toContain("ROLLBACK")
    expect(state.calls).not.toContain("COMMIT")
  })
})
