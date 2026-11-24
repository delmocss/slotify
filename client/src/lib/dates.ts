/** YYYY-MM-DD in the user's local time zone (toISOString() would use UTC and can be off by a day). */
export function toLocalISODate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function todayLocal() {
  return toLocalISODate(new Date())
}

/** Parses YYYY-MM-DD as a LOCAL date. new Date("2026-11-24") is UTC midnight, which is the
 * previous day (and weekday) for users west of UTC. */
export function fromISODate(value: string) {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, m - 1, d)
}
