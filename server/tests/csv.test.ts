import { describe, expect, it } from "vitest"
import { csvCell, toCsv } from "../src/utils/csv"

describe("csv", () => {
  it("leaves plain values alone and writes null as empty", () => {
    expect(csvCell("Ana")).toBe("Ana")
    expect(csvCell(15)).toBe("15")
    expect(csvCell(null)).toBe("")
    expect(csvCell(undefined)).toBe("")
  })

  it("quotes commas, quotes and line breaks", () => {
    expect(csvCell("Pérez, Ana")).toBe('"Pérez, Ana"')
    expect(csvCell('say "hi"')).toBe('"say ""hi"""')
    expect(csvCell("a\nb")).toBe('"a\nb"')
  })

  it.each(["=SUM(A1:A9)", "+1+1", "-2+3", "@cmd", "\tx", "\rx"])(
    "neutralises spreadsheet formulas: %j",
    (value) => {
      expect(csvCell(value).replace(/^"/, "").startsWith("'")).toBe(true)
    }
  )

  it("builds rows", () => {
    expect(
      toCsv([
        ["a", "b"],
        ["=x", "c,d"],
      ])
    ).toBe('a,b\n\'=x,"c,d"')
  })
})
