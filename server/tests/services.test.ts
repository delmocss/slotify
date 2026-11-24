import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  existingSlugs: new Set<string>(),
  updates: [] as { sql: string; params: unknown[] }[],
  uniqueViolationOnInsert: false,
}))

vi.mock("../src/config/db", () => {
  const query = async (sql: string, params: unknown[] = []) => {
    if (sql.includes("SELECT 1 FROM services")) {
      return { rows: state.existingSlugs.has(params[1] as string) ? [{}] : [] }
    }
    if (sql.includes("INSERT INTO services")) {
      if (state.uniqueViolationOnInsert) {
        throw Object.assign(new Error("dup"), { code: "23505" })
      }
      return { rows: [{ id: "s1", slug: params[2] }] }
    }
    if (sql.startsWith("UPDATE services") && sql.includes("SET name") === false) {
      state.updates.push({ sql, params })
      return { rows: [{ id: params[0] }] }
    }
    if (sql.includes("DELETE FROM services")) return { rowCount: 0, rows: [] }
    return { rows: [] }
  }
  return { pool: { query } }
})

import { ServicesService } from "../src/modules/services/services.service"
import { createServiceSchema, updateServiceSchema } from "../src/modules/services/services.schema"

describe("servicios: validacion", () => {
  it("acepta un servicio valido y recorta el nombre", () => {
    const r = createServiceSchema.parse({ name: "  Corte  ", duration_minutes: 30, price: 12.5 })
    expect(r.name).toBe("Corte")
  })

  it.each([
    [{ name: "A", duration_minutes: 30, price: 10 }, "at least 2"],
    [{ name: "Corte", duration_minutes: 0, price: 10 }, "at least 1 minute"],
    [{ name: "Corte", duration_minutes: 30.5, price: 10 }, "whole number"],
    [{ name: "Corte", duration_minutes: 5000, price: 10 }, "24 hours"],
    [{ name: "Corte", duration_minutes: 30, price: -1 }, "negative"],
    [{ name: "Corte", duration_minutes: 30, price: 1e9 }, "cannot exceed"],
    [{ name: "Corte", duration_minutes: 30, price: 1.234 }, "2 decimals"],
  ])("rechaza %j", (input, message) => {
    const r = createServiceSchema.safeParse(input)
    expect(r.success).toBe(false)
    expect(JSON.stringify(r.error?.issues)).toContain(message)
  })

  it("descarta claves desconocidas (no llegan a construir SQL)", () => {
    const r = updateServiceSchema.parse({ price: 5, "price = 0, name": "x", is_active: false })
    expect(Object.keys(r)).toEqual(["price"])
  })

  it("rechaza una actualizacion vacia", () => {
    expect(updateServiceSchema.safeParse({}).success).toBe(false)
  })
})

describe("servicios: reglas de negocio", () => {
  beforeEach(() => {
    state.existingSlugs.clear()
    state.updates.length = 0
    state.uniqueViolationOnInsert = false
  })
  const svc = () => new ServicesService()
  const data = { name: "Corte de pelo", duration_minutes: 30, price: 10 }

  it("crea el servicio con slug derivado del nombre", async () => {
    const r = await svc().create("org", data)
    expect(r.slug).toBe("corte-de-pelo")
  })

  it("responde 409 si ya existe un servicio con ese nombre", async () => {
    state.existingSlugs.add("corte-de-pelo")
    await expect(svc().create("org", data)).rejects.toMatchObject({ statusCode: 409 })
  })

  it("responde 409 (no 500) si pierde una carrera en el unique", async () => {
    state.uniqueViolationOnInsert = true
    await expect(svc().create("org", data)).rejects.toMatchObject({ statusCode: 409 })
  })

  it("responde 400 si el nombre no tiene letras ni numeros", async () => {
    await expect(svc().create("org", { ...data, name: "!!!" })).rejects.toMatchObject({
      statusCode: 400,
    })
  })

  it("responde 404 al borrar un servicio inexistente", async () => {
    await expect(svc().delete("id", "org")).rejects.toMatchObject({ statusCode: 404 })
  })
})
