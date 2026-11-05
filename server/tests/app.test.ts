import request from "supertest"
import { describe, expect, it } from "vitest"
import { app } from "../src/app"

describe("API (sin base de datos)", () => {
  it("GET /health responde ok con cabeceras de seguridad y sin x-powered-by", async () => {
    const res = await request(app).get("/health")
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: "ok" })
    expect(res.headers["x-content-type-options"]).toBe("nosniff")
    expect(res.headers["x-powered-by"]).toBeUndefined()
  })

  it("CORS solo permite el origen configurado", async () => {
    const ok = await request(app).get("/health").set("Origin", "https://front.example.com")
    expect(ok.headers["access-control-allow-origin"]).toBe("https://front.example.com")

    const ajeno = await request(app).get("/health").set("Origin", "https://evil.example")
    expect(ajeno.headers["access-control-allow-origin"]).toBeUndefined()
  })

  it("rechaza rutas protegidas sin token", async () => {
    const res = await request(app).get("/services")
    expect(res.status).toBe(401)
  })

  it("rechaza un token firmado con otro secreto", async () => {
    const jwt = await import("jsonwebtoken")
    const falso = jwt.sign({ businessId: "x" }, "otro-secreto-distinto-de-40-caracteres!!")
    const res = await request(app).get("/services").set("Authorization", `Bearer ${falso}`)
    expect(res.status).toBe(401)
  })

  it("valida el cuerpo del login antes de tocar la base de datos", async () => {
    const res = await request(app).post("/auth/login").send({})
    expect(res.status).toBe(400)
  })

  it("limita los intentos de login (429 tras 20)", async () => {
    let ultimo = 0
    for (let i = 0; i < 25; i++) {
      ultimo = (await request(app).post("/auth/login").send({})).status
    }
    expect(ultimo).toBe(429)
  })
})
