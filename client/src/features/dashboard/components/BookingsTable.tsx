import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cancelBooking } from "../api/dashboard.api"
import { useToast } from "../../../components/ui/toast/useToast"

export default function BookingsTable({ bookings }: any) {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const mutation = useMutation({
  mutationFn: cancelBooking,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["bookings"] })
    addToast("Booking cancelled successfully")
  },
  onError: () => {
    addToast("Failed to cancel booking", "error")
  },
})


  return (
    <div className="bg-surface border border-white/5 rounded-xl overflow-hidden">
      {bookings.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="text-lg mb-2">No bookings found</p>
          <p className="text-sm">
            Try adjusting your filters.
          </p>
        </div>
      ) : (
      <table className="w-full text-left text-white">
        <thead className="bg-ashSoft text-gray-300">
          <tr className="border-b border-white/5">
            <th className="p-3 text-gray-300">Date</th>
            <th className="p-3 text-gray-300">Time</th>
            <th className="p-3 text-gray-300">Client</th>
            <th className="p-3 text-gray-300">Service</th>
            <th className="p-3 text-gray-300">Status</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking: any) => (
            <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5 transition">
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
      )}
    </div>
  )
}
