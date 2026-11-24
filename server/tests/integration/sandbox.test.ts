import fs from "fs"
import path from "path"
import jwt from "jsonwebtoken"
import request from "supertest"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { app } from "../../src/app"
import { pool } from "../../src/config/db"

// Real-Postgres checks for the demo sandbox: every login with the demo account gets a
// private copy of the template, so one visitor's changes never reach another.
//
// Note: the app rate-limits POST /auth/login to 20 per 15 minutes per IP and the limiter
// is shared by this whole file, so keep the total number of logins below that.

const DEMO = { email: "demo@demo.com", password: "demo1234" }
const names = (rows: { name: string }[]) => rows.map((r) => r.name).sort()

const login = (body: object = DEMO) => request(app).post("/auth/login").send(body)
const auth = (token: string) => ({ Authorization: `Bearer ${token}` })

async function count(sql: string, params: unknown[] = []) {
  const res = await pool.query(sql, params)
  return Number(res.rows[0].count)
}

beforeAll(async () => {
  const schema = fs.readFileSync(path.join(__dirname, "../../src/database/schema.sql"), "utf8")
  await pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
  await pool.query(schema)

  // Template: the demo account registered normally (its business slug is "demo-negocio").
  const reg = await request(app)
    .post("/auth/register")
    .send({ name: "Demo Negocio", email: DEMO.email, password: DEMO.password })
  expect(reg.status).toBe(201)
  const orgId = reg.body.organization.id as string

  await pool.query(
    `INSERT INTO services (business_id, name, slug, duration_minutes, price)
     VALUES ($1,'Corte','corte',30,15), ($1,'Barba','barba',20,8.5), ($1,'Tinte','tinte',90,45)`,
    [orgId]
  )
  await pool.query(
    `INSERT INTO working_hours (business_id, day_of_week, start_time, end_time)
     SELECT $1, d, '09:00', '14:00' FROM generate_series(1,5) d`,
    [orgId]
  )
  // Bookings from ~10 to ~5 days ago: all in the past, so the sandbox must shift them.
  await pool.query(
    `INSERT INTO bookings (business_id, service_id, booking_code, cancel_token, client_name,
                           client_email, date, start_time, end_time)
     SELECT $1, s.id, 'SLT-T'||g, 'tok-'||g, 'Cliente '||g, 'c'||g||'@x.com',
            CURRENT_DATE - (5 + g), '10:00', '10:30'
     FROM services s, generate_series(0,5) g WHERE s.business_id = $1 AND s.slug = 'corte'`,
    [orgId]
  )
})

afterAll(async () => {
  await pool.end()
})

describe("demo sandbox (real Postgres)", () => {
  it("isolates visitors, keeps the template pristine and purges expired copies", async () => {
    const a = (await login()).body
    const b = (await login()).body

    expect(a.sandbox).toBe(true)
    expect(a.business.slug).toMatch(/^demo-negocio-[0-9a-f]{6}$/)
    expect(a.business.id).not.toBe(b.business.id)

    // the token expires together with the sandbox (24h), and /auth/me exposes the demo e-mail
    const { exp, iat } = jwt.decode(a.token) as { exp: number; iat: number }
    expect(exp - iat).toBe(24 * 3600)
    const me = await request(app).get("/auth/me").set(auth(a.token))
    expect(me.body.sandbox).toBe(true)
    expect(me.body.demoEmail).toBe("demo@demo.com")

    // each copy starts with the template data
    const aServices = await request(app).get("/services").set(auth(a.token))
    expect(names(aServices.body)).toEqual(["Barba", "Corte", "Tinte"])
    expect((await request(app).get("/working-hours").set(auth(a.token))).body).toHaveLength(5)
    const aBookings = (await request(app).get("/bookings").set(auth(a.token))).body
    expect(aBookings).toHaveLength(6)

    // A changes everything it can
    const created = await request(app)
      .post("/services")
      .set(auth(a.token))
      .send({ name: "Facial", duration_minutes: 60, price: 30 })
    expect(created.status).toBe(201)
    const barba = aServices.body.find((s: { name: string }) => s.name === "Barba")
    expect((await request(app).delete(`/services/${barba.id}`).set(auth(a.token))).status).toBe(204)
    const corte = aServices.body.find((s: { name: string }) => s.name === "Corte")
    const renamed = await request(app)
      .put(`/services/${corte.id}`)
      .set(auth(a.token))
      .send({ name: "Corte premium", price: 99 })
    expect(renamed.body.slug).toBe("corte-premium")
    await request(app)
      .put("/working-hours")
      .set(auth(a.token))
      .send([{ day_of_week: 6, start_time: "10:00", end_time: "12:00" }])
      .expect(204)
    await request(app).patch(`/bookings/${aBookings[0].id}/cancel`).set(auth(a.token)).expect(200)

    // B sees none of it
    const bServices = await request(app).get("/services").set(auth(b.token))
    expect(names(bServices.body)).toEqual(["Barba", "Corte", "Tinte"])
    const bHours = (await request(app).get("/working-hours").set(auth(b.token))).body
    expect(bHours).toHaveLength(5)
    expect(bHours.every((h: { day_of_week: number }) => h.day_of_week >= 1)).toBe(true)
    const bBookings = (await request(app).get("/bookings").set(auth(b.token))).body
    expect(bBookings.every((x: { status: string }) => x.status === "confirmed")).toBe(true)

    // public pages are isolated too
    const pubA = await request(app).get(`/public/${a.business.slug}/services`)
    const pubB = await request(app).get(`/public/${b.business.slug}/services`)
    expect(names(pubA.body)).toContain("Facial")
    expect(names(pubB.body)).not.toContain("Facial")

    // A cannot reach B's data
    const target = bServices.body[0]
    expect((await request(app).delete(`/services/${target.id}`).set(auth(a.token))).status).toBe(
      404
    )

    // the template itself was never touched
    expect(
      await count(
        `SELECT count(*) FROM services s JOIN businesses b ON b.id = s.business_id WHERE b.slug = 'demo-negocio'`
      )
    ).toBe(3)

    // a brand-new visitor starts clean
    const c = (await login()).body
    expect(names((await request(app).get("/services").set(auth(c.token))).body)).toEqual([
      "Barba",
      "Corte",
      "Tinte",
    ])

    // expiry: age A to 25h; the next demo login purges it (and only it)
    await pool.query("UPDATE users SET created_at = NOW() - INTERVAL '25 hours' WHERE id = $1", [
      a.user.id,
    ])
    await login()
    expect(await count("SELECT count(*) FROM users WHERE id = $1", [a.user.id])).toBe(0)
    for (const table of ["businesses", "services", "bookings", "working_hours"]) {
      const col = table === "businesses" ? "id" : "business_id"
      expect(
        await count(`SELECT count(*) FROM ${table} WHERE ${col} = $1`, [a.organization.id])
      ).toBe(0)
    }
    expect((await request(app).get("/services").set(auth(a.token))).status).toBeGreaterThanOrEqual(
      401
    )
    expect(names((await request(app).get("/services").set(auth(b.token))).body)).toEqual([
      "Barba",
      "Corte",
      "Tinte",
    ])
    expect(await count("SELECT count(*) FROM users WHERE email = $1", [DEMO.email])).toBe(1)
  })

  it("slides the copied bookings forward so the demo never looks empty", async () => {
    const v = (await login()).body
    const bookings = (await request(app).get("/bookings").set(auth(v.token))).body as {
      date: string
    }[]
    // codes are generated in SQL: right format, all different, none reused from the template
    expect(bookings).toHaveLength(6)
    const codes = (
      await pool.query(
        `SELECT k.booking_code, length(k.cancel_token) AS token_len
         FROM bookings k JOIN businesses b ON b.id = k.business_id WHERE b.id = $1`,
        [v.organization.id]
      )
    ).rows as { booking_code: string; token_len: number }[]
    expect(codes).toHaveLength(6)
    expect(codes.every((x) => /^SLT-[0-9A-F]{8}$/.test(x.booking_code))).toBe(true)
    expect(new Set(codes.map((x) => x.booking_code)).size).toBe(6)
    expect(codes.every((x) => x.token_len === 64)).toBe(true)
    expect(
      await count(
        `SELECT count(*) FROM bookings k JOIN businesses b ON b.id = k.business_id
         WHERE b.slug = 'demo-negocio' AND k.booking_code LIKE 'SLT-T%'`
      )
    ).toBe(6)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dates = bookings.map((x) => new Date(x.date).getTime())
    // template's newest booking was 5 days ago -> in the copy it is today
    const newest = Math.max(...dates)
    const diffDays = Math.abs(Math.round((newest - today.getTime()) / 86_400_000))
    expect(diffDays).toBeLessThanOrEqual(1) // tolerance for timezone rounding of DATE
    // and nothing was moved into the future
    expect(newest - today.getTime()).toBeLessThanOrEqual(86_400_000)
  })

  it("does not create a sandbox for a wrong password, and real accounts are not sandboxes", async () => {
    const before = await count(
      "SELECT count(*) FROM users WHERE email LIKE '%@sandbox.slotify.local'"
    )
    expect((await login({ email: DEMO.email, password: "wrong-password" })).status).toBe(401)
    expect(
      await count("SELECT count(*) FROM users WHERE email LIKE '%@sandbox.slotify.local'")
    ).toBe(before)

    await request(app)
      .post("/auth/register")
      .send({ name: "Real Negocio", email: "real@real.com", password: "real12345" })
      .expect(201)
    const real = (await login({ email: "real@real.com", password: "real12345" })).body
    expect(real.sandbox).toBeUndefined()
    const me = await request(app).get("/auth/me").set(auth(real.token))
    expect(me.body.sandbox).toBe(false)
  })

  it("serves several simultaneous demo logins, each with its own sandbox", async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => login()))
    expect(results.every((r) => r.status === 200)).toBe(true)
    expect(new Set(results.map((r) => r.body.business.slug)).size).toBe(5)
  })
})

describe("services and working hours (real Postgres)", () => {
  let token: string

  beforeAll(async () => {
    token = (await login({ email: "real@real.com", password: "real12345" })).body.token
  })

  it("rejects bad input with 4xx instead of 500", async () => {
    const post = (body: object) => request(app).post("/services").set(auth(token)).send(body)
    expect((await post({ name: "Masaje", duration_minutes: 45, price: 20 })).status).toBe(201)
    const dup = await post({ name: "masaje", duration_minutes: 45, price: 20 })
    expect(dup.status).toBe(409)
    expect((await post({ name: "!!!", duration_minutes: 10, price: 1 })).status).toBe(400)
    expect((await post({ name: "Huge", duration_minutes: 10, price: 99999999999 })).status).toBe(
      400
    )
    expect((await post({ name: "Neg", duration_minutes: -5, price: 1 })).status).toBe(400)
    expect((await request(app).delete("/services/not-a-uuid").set(auth(token))).status).toBe(404)
    expect((await request(app).patch("/services/nope/toggle").set(auth(token))).status).toBe(404)
  })

  it("ignores unknown keys on update (no column-name injection)", async () => {
    const [own] = (await request(app).get("/services").set(auth(token))).body
    const res = await request(app)
      .put(`/services/${own.id}`)
      .set(auth(token))
      .send({ price: 5, "price = 0, name = 'pwned' WHERE true --": 1 })
    expect(res.status).toBe(200)
    const [after] = (await request(app).get("/services").set(auth(token))).body
    expect(after.name).toBe("Masaje")
    expect(Number(after.price)).toBe(5)
    expect((await request(app).put(`/services/${own.id}`).set(auth(token)).send({})).status).toBe(
      400
    )
  })

  it("keeps the previous schedule when a save is rejected", async () => {
    await request(app)
      .put("/working-hours")
      .set(auth(token))
      .send([{ day_of_week: 1, start_time: "09:00", end_time: "17:00" }])
      .expect(204)
    const bad = await request(app)
      .put("/working-hours")
      .set(auth(token))
      .send([
        { day_of_week: 2, start_time: "09:00", end_time: "10:00" },
        { day_of_week: 3, start_time: "18:00", end_time: "08:00" },
      ])
    expect(bad.status).toBe(400)
    expect((await request(app).get("/working-hours").set(auth(token))).body).toHaveLength(1)
  })
})

describe("dashboard data (real Postgres)", () => {
  let token: string

  beforeAll(async () => {
    token = (await login()).body.token
  })

  it("GET /bookings returns what the dashboard shows: e-mail, end time, code, service", async () => {
    const res = await request(app).get("/bookings").set(auth(token))
    expect(res.status).toBe(200)
    const [first] = res.body
    expect(first).toMatchObject({
      client_email: expect.stringContaining("@"),
      end_time: expect.any(String),
      booking_code: expect.stringMatching(/^SLT-/),
      service_name: expect.any(String),
    })
    // the secret used to cancel from a public link is never listed
    expect(first.cancel_token).toBeUndefined()
  })

  it("GET /analytics/metrics matches the data and counts the same 7 days as the chart", async () => {
    const before = (await request(app).get("/analytics/metrics").set(auth(token))).body
    expect(Number(before.total_bookings)).toBe(6)
    expect(Number(before.cancelled_bookings)).toBe(0)
    expect(Number(before.total_revenue)).toBe(90) // 6 x 15
    expect(Number(before.bookings_last_7_days)).toBe(6) // newest booking was shifted to today

    const [one] = (await request(app).get("/bookings").set(auth(token))).body
    await request(app).patch(`/bookings/${one.id}/cancel`).set(auth(token)).expect(200)

    const after = (await request(app).get("/analytics/metrics").set(auth(token))).body
    expect(Number(after.total_bookings)).toBe(5)
    expect(Number(after.cancelled_bookings)).toBe(1)
    expect(Number(after.total_revenue)).toBe(75)
  })

  it("export: rejects bad ranges with 400 and escapes CSV (no formula injection)", async () => {
    const export_ = (query: string) =>
      request(app).get(`/analytics/export?${query}`).set(auth(token))
    expect((await export_("from=nope&to=2026-01-01")).status).toBe(400)
    expect((await export_("from=2026-02-01&to=2026-01-01")).status).toBe(400)
    expect((await export_("from=2026-02-31&to=2026-03-01")).status).toBe(400)
    expect((await export_("")).status).toBe(400)

    // a booking made through the public page with a hostile name
    const [svc] = (await request(app).get("/services").set(auth(token))).body
    const me = (await request(app).get("/auth/me").set(auth(token))).body
    const day = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10)
    await pool.query(
      `INSERT INTO bookings (business_id, service_id, booking_code, cancel_token, client_name,
                             client_email, date, start_time, end_time)
       SELECT b.id, $2, 'SLT-EVIL1', 'evil-token', '=HYPERLINK("http://x","hi"), Bob', 'a@b.com',
              $3, '10:00', '10:30'
       FROM businesses b WHERE b.slug = $1`,
      [me.slug, svc.id, day]
    )
    const from = new Date().toISOString().slice(0, 10)
    const res = await export_(`from=${from}&to=${day}`)
    expect(res.status).toBe(200)
    expect(res.headers["content-type"]).toContain("text/csv")
    const evil = res.text.split(String.fromCharCode(10)).find((l) => l.includes("Bob"))!
    expect(evil.startsWith("2")).toBe(true) // date first, starts with a digit
    expect(evil).toContain(`"'=HYPERLINK(""http://x"",""hi""), Bob"`)
  })
})
