/** YYYY-MM-DD in the user's local time zone (toISOString() would use UTC and can be off by a day). */
export function toLocalISODate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function todayLocal() {
  return toLocalISODate(new Date())
}
