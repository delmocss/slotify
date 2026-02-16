import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cancelBooking } from "../api/dashboard.api"

export default function BookingsTable({ bookings }: any) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
  })

  return (
    <div className="bg-white shadow rounded">
      <table className="w-full text-left">
        <thead className="border-b">
          <tr>
            <th className="p-3">Date</th>
            <th className="p-3">Time</th>
            <th className="p-3">Client</th>
            <th className="p-3">Service</th>
            <th className="p-3">Status</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking: any) => (
            <tr key={booking.id} className="border-b">
              <td className="p-3">{booking.date}</td>
              <td className="p-3">{booking.start_time}</td>
              <td className="p-3">{booking.client_name}</td>
              <td className="p-3">{booking.service_name}</td>
              <td className="p-3">
                <span
                  className={
                    booking.status === "confirmed"
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  {booking.status}
                </span>
              </td>
              <td className="p-3">
                {booking.status === "confirmed" && (
                  <button
                    onClick={() => mutation.mutate(booking.id)}
                    className="text-red-500"
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
