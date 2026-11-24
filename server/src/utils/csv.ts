// Minimal, safe CSV writer (RFC 4180 quoting + spreadsheet formula-injection guard).

/** One CSV cell. Text typed by clients (names, e-mails) ends up in the file, so a value
 * starting with = + - @ (or a tab/CR) is prefixed with an apostrophe: spreadsheets then show
 * it as text instead of running it as a formula. */
export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(rows: unknown[][]): string {
  return rows.map((row) => row.map(csvCell).join(",")).join("\n")
}
