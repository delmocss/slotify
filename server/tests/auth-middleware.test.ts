import jwt from "jsonwebtoken"
import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({ dbDown: false, member: true }))

vi.mock("../src/config/db", () => {
  const query = async (sql: string) => {
    if (sql.includes("FROM organization_members")) {
      if (state.dbDown) throw new Error("connection terminated")
      return { rows: state.member ? [{ id: "m1", role: "owner" }] : [] }
    }
    return { rows: [] }
  }
  return { pool: { query, connect: async () => ({ query, release: () => {} }) } }
})

import { app } from "../src/app"

const secret = "x".repeat(40) // same as vitest.config.ts
const token = () => jwt.sign({ sub: "u1", org: "o1", role: "owner" }, secret, { expiresIn: "1h" })

describe("protect middleware", () => {
  beforeEach(() => {
    state.dbDown = false
    state.member = true
  })

  it("answers 401 for a bad token", async () => {
    const res = await request(app).get("/services").set("Authorization", "Bearer nope")
    expect(res.status).toBe(401)
  })

  it("answers 403 when the user is not a member of the organization", async () => {
    state.member = false
    const res = await request(app).get("/services").set("Authorization", `Bearer ${token()}`)
    expect(res.status).toBe(403)
  })

  it("answers 500, not 401, when the database fails (a valid session must not look logged out)", async () => {
    state.dbDown = true
    const res = await request(app).get("/services").set("Authorization", `Bearer ${token()}`)
    expect(res.status).toBe(500)
  })
})
