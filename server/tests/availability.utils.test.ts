import { describe, expect, it } from "vitest"
import {
  generateSlots,
  hasConflict,
  minutesToTime,
  timeToMinutes,
} from "../src/modules/availability/availability.utils"

describe("timeToMinutes / minutesToTime", () => {
  it("convierte ida y vuelta", () => {
    expect(timeToMinutes("09:30")).toBe(570)
    expect(minutesToTime(570)).toBe("09:30")
    expect(minutesToTime(timeToMinutes("00:05"))).toBe("00:05")
  })
})

describe("generateSlots", () => {
  it("genera huecos consecutivos de la duracion del servicio", () => {
    expect(generateSlots("09:00", "11:00", 30).map((s) => s.start)).toEqual([
      "09:00",
      "09:30",
      "10:00",
      "10:30",
    ])
  })

  it("no genera un hueco que se pasa del fin del horario", () => {
    const slots = generateSlots("09:00", "10:00", 45)
    expect(slots).toEqual([{ start: "09:00", end: "09:45" }])
  })

  it("devuelve vacio si el servicio es mas largo que la franja", () => {
    expect(generateSlots("09:00", "09:30", 60)).toEqual([])
  })
})

describe("hasConflict", () => {
  it("detecta solapamientos parciales y totales", () => {
    expect(hasConflict(540, 600, 570, 630)).toBe(true) // parcial
    expect(hasConflict(540, 600, 540, 600)).toBe(true) // identico
    expect(hasConflict(540, 720, 570, 600)).toBe(true) // contiene
  })

  it("permite huecos contiguos (el fin de uno es el inicio del otro)", () => {
    expect(hasConflict(540, 600, 600, 660)).toBe(false)
    expect(hasConflict(600, 660, 540, 600)).toBe(false)
  })
})
