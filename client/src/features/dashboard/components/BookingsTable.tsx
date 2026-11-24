import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cancelBooking } from "../api/dashboard.api"
import { useI18n } from "@/lib/i18n/useI18n"
import { formatTime, fromISODate } from "@/lib/dates"
import { useToast } from "../../../components/ui/toast/useToast"
import { Booking } from "@/types"

interface BookingsTableProps {
  bookings: Booking[]
}

export default function BookingsTable({ bookings }: BookingsTableProps) {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const { t, locale } = useI18n()

  const mutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      queryClient.invalidateQueries({ queryKey: ["metrics"] })
      addToast(t("table.cancelled"))
    },
    onError: () => {
      addToast(t("table.cancelFailed"), "error")
    },
  })

  return (
    <div className="relative bg-gradient-to-br from-[#1a1b17]/50 via-[#1a1b17]/30 to-[#1a1b17]/50 backdrop-blur-xl border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-copper/[0.02] via-transparent to-transparent pointer-events-none" />

      <div className="relative">
        {bookings.length === 0 ? (
          <div className="px-4 py-20 text-center sm:py-32">
            <div className="inline-block mb-6">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-2 tracking-tight">
              {t("table.empty.title")}
            </p>
            <p className="text-xs text-gray-700 tracking-wide">{t("table.empty.text")}</p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-white/[0.04] lg:hidden">
              {bookings.map((booking) => {
                const confirmed = booking.status === "confirmed"
                return (
                  <li key={booking.id} className="flex flex-col gap-3 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white/90">
                          {booking.client_name}
                        </p>
                        <p className="truncate text-xs text-gray-500">{booking.client_email}</p>
                      </div>
                      <span
                        className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                          confirmed
                            ? "border-green-500/25 bg-green-500/10 text-green-300"
                            : "border-white/10 bg-white/5 text-gray-500"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${confirmed ? "bg-green-400" : "bg-gray-600"}`}
                        />
                        {confirmed ? t("status.confirmed") : t("status.cancelled")}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                      <span className="font-semibold text-gray-200">
                        {fromISODate(booking.date).toLocaleDateString(locale, {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span className="font-mono tracking-wider">
                        {formatTime(booking.start_time)} · {formatTime(booking.end_time)}
                      </span>
                      <span className="truncate">{booking.service_name}</span>
                    </div>

                    {confirmed && (
                      <button
                        onClick={() => mutation.mutate(booking.id)}
                        disabled={mutation.isPending}
                        className="self-start rounded-lg border border-white/10 px-3.5 py-2 text-xs font-semibold text-gray-300 transition hover:border-red-400/40 hover:text-red-300 disabled:opacity-40"
                      >
                        {t("table.cancel")}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.03]">
                    <th className="px-5 py-5 xl:px-8 text-[9px] font-extrabold text-gray-600 uppercase tracking-[0.2em] bg-gradient-to-b from-white/[0.01] to-transparent">
                      {t("table.date")}
                    </th>
                    <th className="px-5 py-5 xl:px-8 text-[9px] font-extrabold text-gray-600 uppercase tracking-[0.2em]">
                      {t("table.time")}
                    </th>
                    <th className="px-5 py-5 xl:px-8 text-[9px] font-extrabold text-gray-600 uppercase tracking-[0.2em]">
                      {t("table.client")}
                    </th>
                    <th className="px-5 py-5 xl:px-8 text-[9px] font-extrabold text-gray-600 uppercase tracking-[0.2em]">
                      {t("table.service")}
                    </th>
                    <th className="px-5 py-5 xl:px-8 text-[9px] font-extrabold text-gray-600 uppercase tracking-[0.2em]">
                      {t("table.status")}
                    </th>
                    <th className="px-5 py-5 xl:px-8 text-[9px] font-extrabold text-gray-600 uppercase tracking-[0.2em] text-right bg-gradient-to-b from-white/[0.01] to-transparent">
                      {t("table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, index) => (
                    <tr
                      key={booking.id}
                      style={{
                        animation: `fadeIn 0.4s ease-out ${index * 0.05}s both`,
                      }}
                      className="group border-b border-white/[0.02] hover:bg-gradient-to-r hover:from-white/[0.015] hover:via-white/[0.01] hover:to-transparent transition-all duration-300"
                    >
                      <td className="px-5 py-6 xl:px-8">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-px h-10 bg-gradient-to-b from-copper/60 via-copper/30 to-transparent rounded-full" />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-copper/80 shadow-lg shadow-copper/50" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-white/90 tracking-tight leading-none">
                              {fromISODate(booking.date).toLocaleDateString(locale, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="text-[10px] text-gray-700 font-semibold uppercase tracking-[0.1em]">
                              {fromISODate(booking.date).toLocaleDateString(locale, {
                                weekday: "short",
                              })}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-6 xl:px-8">
                        <div className="font-mono text-[11px] text-gray-500 tracking-wider leading-relaxed">
                          {formatTime(booking.start_time)}
                          <span className="mx-2 text-gray-700">·</span>
                          {formatTime(booking.end_time)}
                        </div>
                      </td>
                      <td className="px-5 py-6 xl:px-8">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-bold text-white/90 tracking-tight">
                            {booking.client_name}
                          </span>
                          <span className="text-[10px] text-gray-500 tracking-wide">
                            {booking.client_email}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-6 xl:px-8">
                        <span className="text-[13px] text-gray-500 font-semibold tracking-tight">
                          {booking.service_name}
                        </span>
                      </td>
                      <td className="px-5 py-6 xl:px-8">
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <div
                              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                booking.status === "confirmed"
                                  ? "bg-green-400 shadow-lg shadow-green-400/50"
                                  : "bg-gray-700"
                              }`}
                            />
                            {booking.status === "confirmed" && (
                              <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-green-400 animate-ping opacity-40" />
                            )}
                          </div>
                          <span
                            className={`text-[11px] font-bold tracking-wide transition-colors duration-300 ${
                              booking.status === "confirmed" ? "text-gray-400" : "text-gray-700"
                            }`}
                          >
                            {booking.status === "confirmed"
                              ? t("status.confirmed")
                              : t("status.cancelled")}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-6 xl:px-8 text-right">
                        {booking.status === "confirmed" && (
                          <button
                            onClick={() => mutation.mutate(booking.id)}
                            disabled={mutation.isPending}
                            className="relative text-[11px] font-bold text-gray-600 hover:text-red-400 tracking-wide transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group-hover:translate-x-0 translate-x-1"
                          >
                            <span className="relative">
                              {mutation.isPending ? "···" : t("table.cancel")}
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
          </>
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
