type Props = {
  bookings: any[]
}

export default function StatsCards({ bookings }: Props) {
  const today = new Date().toISOString().split("T")[0]

  const todayCount = bookings.filter(
    (b) => b.date === today
  ).length

  const confirmedCount = bookings.filter(
    (b) => b.status === "confirmed"
  ).length

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-surface border border-white/5 rounded-xl p-6">
        <p className="text-gray-400 text-sm">Bookings Today</p>
        <p className="text-2xl font-bold text-white">{todayCount}</p>
      </div>

      <div className="bg-surface border border-white/5 rounded-xl p-6">
        <p className="text-gray-400 text-sm">Total Confirmed</p>
        <p className="text-2xl font-bold text-white">{confirmedCount}</p>
      </div>

      <div className="bg-surface border border-white/5 rounded-xl p-6">
        <p className="text-gray-400 text-sm">Total Bookings</p>
        <p className="text-2xl font-bold text-white">{bookings.length}</p>
      </div>
    </div>
  )
}
