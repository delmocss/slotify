import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cancelBooking } from "../api/dashboard.api"
import { useToast } from "../../../components/ui/toast/useToast"
import { Booking } from "@/types"

interface BookingsTableProps {
  bookings: Booking[]
}

export default function BookingsTable({ bookings }: BookingsTableProps) {
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
    <div className="relative bg-gradient-to-br from-[#1a1b17]/50 via-[#1a1b17]/30 to-[#1a1b17]/50 backdrop-blur-xl border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-copper/[0.02] via-transparent to-transparent pointer-events-none" />
      
      <div className="relative">
        {bookings.length === 0 ? (
          <div className="text-center py-32">
            <div className="inline-block mb-6">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-2 tracking-tight">No bookings yet</p>
            <p className="text-xs text-gray-700 tracking-wide">
              Adjust your filters or create new bookings
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.03]">
                  <th className="px-8 py-5 text-[9px] font-extrabold text-gray-600 uppercase tracking-[0.2em] bg-gradient-to-b from-white/[0.01] to-transparent">
                    Date
                  </th>
                  <th className="px-8 py-5 text-[9px] font-extrabold text-gray-600 uppercase tracking-[0.2em]">
                    Time
                  </th>
                  <th className="px-8 py-5 text-[9px] font-extrabold text-gray-600 uppercase tracking-[0.2em]">
                    Client
                  </th>
                  <th className="px-8 py-5 text-[9px] font-extrabold text-gray-600 uppercase tracking-[0.2em]">
                    Service
                  </th>
                  <th className="px-8 py-5 text-[9px] font-extrabold text-gray-600 uppercase tracking-[0.2em]">
                    Status
                  </th>
                  <th className="px-8 py-5 text-[9px] font-extrabold text-gray-600 uppercase tracking-[0.2em] text-right bg-gradient-to-b from-white/[0.01] to-transparent">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr
                    key={booking.id}
                    style={{ 
                      animation: `fadeIn 0.4s ease-out ${index * 0.05}s both`
                    }}
                    className="group border-b border-white/[0.02] hover:bg-gradient-to-r hover:from-white/[0.015] hover:via-white/[0.01] hover:to-transparent transition-all duration-300"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-px h-10 bg-gradient-to-b from-copper/60 via-copper/30 to-transparent rounded-full" />
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-copper/80 shadow-lg shadow-copper/50" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-white/90 tracking-tight leading-none">
                            {new Date(booking.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </span>
                          <span className="text-[10px] text-gray-700 font-semibold uppercase tracking-[0.1em]">
                            {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-mono text-[11px] text-gray-500 tracking-wider leading-relaxed">
                        {booking.start_time}
                        <span className="mx-2 text-gray-700">·</span>
                        {booking.end_time}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-white/90 tracking-tight">
                          {booking.client_name}
                        </span>
                        <span className="text-[10px] text-gray-700 tracking-wide">
                          {booking.client_email}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[13px] text-gray-500 font-semibold tracking-tight">
                        {booking.service_name}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            booking.status === "confirmed" 
                              ? "bg-green-400 shadow-lg shadow-green-400/50" 
                              : "bg-gray-700"
                          }`} />
                          {booking.status === "confirmed" && (
                            <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-green-400 animate-ping opacity-40" />
                          )}
                        </div>
                        <span className={`text-[11px] font-bold tracking-wide transition-colors duration-300 ${
                          booking.status === "confirmed" ? "text-gray-400" : "text-gray-700"
                        }`}>
                          {booking.status === "confirmed" ? "Confirmed" : "Cancelled"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => mutation.mutate(booking.id)}
                          disabled={mutation.isPending}
                          className="relative text-[11px] font-bold text-gray-600 hover:text-red-400 tracking-wide transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group-hover:translate-x-0 translate-x-1"
                        >
                          <span className="relative">
                            {mutation.isPending ? "···" : "Cancel"}
                            <span className="absolute bottom-0 left-0 w-0 h-px bg-red-400 group-hover:w-full transition-all duration-300" />
                          </span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
