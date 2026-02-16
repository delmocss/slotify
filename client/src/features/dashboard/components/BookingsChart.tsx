import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"

type Props = {
  bookings: any[]
}

export default function BookingsChart({ bookings }: Props) {
  // Agrupar últimos 7 días
  const today = new Date()

  const data = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date()
    date.setDate(today.getDate() - (6 - index))

    const dateString = date.toISOString().split("T")[0]

    const count = bookings.filter(
      (b) => b.date === dateString && b.status === "confirmed"
    ).length

    return {
      date: dateString.slice(5), // MM-DD
      bookings: count,
    }
  })

  return (
    <div className="bg-white p-6 shadow rounded">
      <h3 className="text-lg font-semibold mb-4">
        Bookings (Last 7 Days)
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="bookings" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
