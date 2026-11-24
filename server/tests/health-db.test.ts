import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({ fail: false, queries: [] as string[] }))

vi.mock("../src/config/db", () => {
  const query = async (sql: string) => {
    state.queries.push(sql.trim())
    if (state.fail) throw new Error("connection refused: secret-host:5432")
    return { rows: [{ "?column?": 1 }] }
  }
  return { pool: { query, connect: async () => ({ query, release: () => {} }) } }
})

import { app } from "../src/app"

describe("GET /health/db", () => {
  beforeEach(() => {
    state.fail = false
    state.queries.length = 0
  })

  it("queries the database and answers ok", async () => {
    const res = await request(app).get("/health/db")
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: "ok" })
    expect(state.queries).toContain("SELECT 1")
  })

  it("answers 503 without leaking the error when the database is down", async () => {
    state.fail = true
    const res = await request(app).get("/health/db")
    expect(res.status).toBe(503)
    expect(res.body).toEqual({ status: "error" })
    expect(JSON.stringify(res.body)).not.toContain("secret-host")
  })

  it("/health stays independent of the database", async () => {
    state.fail = true
    expect((await request(app).get("/health")).status).toBe(200)
  })
})
