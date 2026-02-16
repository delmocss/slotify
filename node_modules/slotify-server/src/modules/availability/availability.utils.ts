export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function generateSlots(
  startTime: string,
  endTime: string,
  duration: number
) {
  const slots: { start: string; end: string }[] = []

  let start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)

  while (start + duration <= end) {
    const slotStart = start
    const slotEnd = start + duration

    slots.push({
      start: minutesToTime(slotStart),
      end: minutesToTime(slotEnd),
    })

    start += duration
  }

  return slots
}

export function hasConflict(
  slotStart: number,
  slotEnd: number,
  bookingStart: number,
  bookingEnd: number
) {
  return slotStart < bookingEnd && slotEnd > bookingStart
}
