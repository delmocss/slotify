import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getPublicServices, getPublicBusiness } from "../api/public.api"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getAvailability } from "../api/public.api"
import { createBooking } from "../api/public.api"
import { useToast } from "../../../components/ui/toast/useToast"
import { api } from "../../../lib/axios"
import { CheckCircle2 } from "lucide-react"
import { useI18n } from "@/lib/i18n/useI18n"
import { getApiErrorMessage } from "@/lib/apiError"
import DatePicker from "@/components/ui/DatePicker"
import { todayLocal } from "@/lib/dates"
import Skeleton from "@/components/ui/Skeleton"
import { Service, CreateBookingRequest, CreateBookingResponse } from "@/types"

type Step = "service" | "date" | "time" | "client" | "success"

function groupSlots(slots: string[]) {
  const morning: string[] = []
  const afternoon: string[] = []
  const evening: string[] = []

  slots.forEach((slot) => {
    const hour = parseInt(slot.split(":")[0])

    if (hour < 12) morning.push(slot)
    else if (hour < 18) afternoon.push(slot)
    else evening.push(slot)
  })

  return { morning, afternoon, evening }
}

export default function PublicBookingPage() {
  const { slug } = useParams()
  const { addToast } = useToast()
  const { t, locale } = useI18n()

  const [step, setStep] = useState<Step>("service")
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const [selectedDate, setSelectedDate] = useState<string>("")
  const [availableSlots, setAvailableSlots] = useState<string[]>([])

  const servicesQuery = useQuery<Service[]>({
    queryKey: ["public-services", slug],
    queryFn: () => getPublicServices(slug!),
  })

  const availabilityQuery = useQuery({
    queryKey: ["availability", slug, selectedService?.id, selectedDate],
    queryFn: () => getAvailability(slug!, selectedService!.id, selectedDate),
    enabled: !!selectedService && !!selectedDate,
  })
  const availabilityData = availabilityQuery.data?.slots ?? availableSlots
  const groupedSlots = groupSlots(availabilityData ?? [])
  const next = (nextStep: Step) => setStep(nextStep)

  const [selectedTime, setSelectedTime] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const businessQuery = useQuery<{ name: string; slug: string }>({
    queryKey: ["public-business", slug],
    queryFn: () => getPublicBusiness(slug!),
  })

  const [confirmation, setConfirmation] = useState<CreateBookingResponse | null>(null)

  const onSubmit = async (data: CreateBookingRequest) => {
    try {
      setIsSubmitting(true)
      const result = await createBooking(slug!, data)
      setConfirmation(result)
      addToast(t("booking.toastConfirmed"))
      setStep("success")
    } catch (error) {
      addToast(getApiErrorMessage(error, t, "booking.toastFailed"), "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = async () => {
    await api.post(`/public/cancel/${confirmation?.cancel_token}`)
    setConfirmation(null)
    addToast(t("booking.toastCancelled"))
  }

  const formatPrice = (price: number | string) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(Number(price))
  const formatDay = (value: string) => {
    const [y, m, d] = value.split("-").map(Number)
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(y, m - 1, d))
  }

  const steps = [
    { key: "service", label: t("booking.step.service") },
    { key: "date", label: t("booking.step.date") },
    { key: "time", label: t("booking.step.time") },
    { key: "client", label: t("booking.step.client") },
  ] as const

  const summaryService = selectedService?.name ?? t("booking.selectService")
  const summaryDuration = selectedService
    ? `${selectedService.duration_minutes} ${t("services.minUnit")}`
    : "—"
  const summaryPrice = selectedService ? formatPrice(selectedService.price) : "—"
  const summaryDate = selectedDate ? formatDay(selectedDate) : t("booking.pickDate")
  const summaryTime = selectedTime || t("booking.pickTime")

  const renderSlot = (slot: string) => (
    <button
      key={slot}
      onClick={() => setSelectedTime(slot)}
      className={`px-4 py-2.5 rounded-full border text-sm font-semibold tracking-wide transition ${
        selectedTime === slot
          ? "bg-copper text-white border-copper shadow-lg shadow-copper/20"
          : "bg-ashSoft/80 text-white/80 border-white/10 hover:border-copper/60"
      }`}
    >
      {slot}
    </button>
  )

  if (confirmation) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#2f302c] via-[#3B3C36] to-black px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <div className="mx-auto w-full max-w-xl rounded-3xl border border-white/10 bg-[#2A2B27]/95 p-6 text-center text-white shadow-2xl backdrop-blur-sm sm:p-10 lg:p-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-copper/15 text-copper ring-1 ring-copper/30 sm:mb-5">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </div>

          <h1 className="mb-3 text-2xl font-bold sm:text-3xl">{t("booking.confirmed")}</h1>

          <p className="mx-auto mb-6 max-w-sm text-sm text-gray-300 sm:mb-8 sm:text-base">
            {t("booking.confirmedText")}
          </p>

          <div className="mb-6 rounded-2xl border border-white/10 bg-ashSoft/90 px-4 py-5 sm:mb-8 sm:px-6 sm:py-6">
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-gray-400 sm:text-sm">
              {t("booking.code")}
            </p>

            <p className="break-all text-xl font-mono font-bold tracking-[0.14em] text-copper sm:text-2xl">
              {confirmation.booking_code}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => navigator.clipboard.writeText(confirmation.booking_code)}
              className="w-full rounded-xl bg-copper px-6 py-3 font-semibold text-white transition hover:brightness-95 sm:w-auto"
            >
              {t("booking.copyCode")}
            </button>

            <button
              onClick={handleCancel}
              className="text-sm text-red-400 transition hover:text-red-300 sm:text-base"
            >
              {t("booking.cancelThis")}
            </button>

            <button
              onClick={() => window.location.reload()}
              className="text-sm text-gray-400 transition hover:text-white sm:text-base"
            >
              {t("booking.another")}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#2f302c] via-[#3B3C36] to-black px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-copper/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative mx-auto w-full max-w-4xl rounded-2xl border border-white/5 bg-[#262722]/90 p-5 text-white shadow-2xl backdrop-blur-sm sm:rounded-3xl sm:p-8 lg:p-10"
      >
        <div className="mb-8 text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">
            {t("booking.eyebrow")}
          </p>
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
            {businessQuery.data?.name}
          </h1>
          <p className="mt-2 text-sm text-gray-400">{t("booking.subtitle")}</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-600">
            {steps.map((item) => (
              <span key={item.key} className={step === item.key ? "text-gray-300" : ""}>
                {item.label}
              </span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {steps.map((item) => (
              <div
                key={item.key}
                className={`h-1 rounded-full transition ${
                  step === item.key ? "bg-copper" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <div>
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                    {t("booking.summary")}
                  </p>
                  <p className="text-sm font-semibold text-white/90">{summaryService}</p>
                  <p className="text-xs text-gray-500">
                    {summaryDate} • {summaryTime}
                  </p>
                </div>
                <p className="text-sm font-semibold text-white/80">{summaryPrice}</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === "service" && (
                <motion.div
                  key="service"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 sm:space-y-5"
                >
                  {servicesQuery.isLoading ? (
                    <div className="max-w-3xl w-full">
                      <Skeleton className="h-10 w-1/2 mx-auto mb-8" />
                      <Skeleton className="h-40 w-full" />
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:gap-4">
                      {servicesQuery.data?.map((service: Service) => (
                        <button
                          key={service.id}
                          onClick={() => {
                            setSelectedService(service)
                            next("date")
                          }}
                          className={`group rounded-2xl border p-4 text-left transition-all duration-200 sm:p-5 md:p-6 ${
                            selectedService?.id === service.id
                              ? "border-copper/60 bg-ashSoft text-white shadow-lg shadow-copper/10"
                              : "border-white/10 bg-ashSoft/80 text-white/90 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold sm:text-base">{service.name}</p>
                              <p className="text-xs text-white/70 sm:text-sm">
                                {t("booking.duration", { minutes: service.duration_minutes })}
                              </p>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                              {formatPrice(service.price)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {step === "date" && (
                <motion.div
                  key="date"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 sm:space-y-5"
                >
                  <p className="text-sm font-semibold sm:text-base">
                    {t("booking.selected", { name: selectedService?.name ?? "" })}
                  </p>

                  <DatePicker
                    value={selectedDate}
                    min={todayLocal()}
                    onChange={setSelectedDate}
                    placeholder={t("booking.choose")}
                    aria-label={t("booking.dateAria")}
                  />

                  {availabilityQuery.isLoading && (
                    <p className="text-gray-500">{t("booking.checking")}</p>
                  )}

                  {availabilityQuery.data?.slots?.length === 0 && selectedDate && (
                    <p className="text-red-500">{t("booking.noSlots")}</p>
                  )}

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      onClick={() => setStep("service")}
                      className="self-start text-sm text-gray-400 transition hover:text-white"
                    >
                      {t("common.back")}
                    </button>

                    {availabilityQuery.data?.slots?.length > 0 && (
                      <button
                        onClick={() => {
                          setAvailableSlots(availabilityData ?? [])
                          next("time")
                        }}
                        className="w-full rounded-full bg-copper px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 sm:w-auto sm:text-base"
                      >
                        {t("common.continue")}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {step === "time" && (
                <motion.div
                  key="time"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5 sm:space-y-6"
                >
                  <p className="text-sm font-semibold sm:text-base">
                    {selectedService?.name} - {formatDay(selectedDate)}
                  </p>

                  {availabilityQuery.isLoading ? (
                    <div className="grid grid-cols-3 gap-3">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-11 w-full rounded-full" />
                      ))}
                    </div>
                  ) : (
                    <>
                      {availabilityData.length === 0 && (
                        <div className="text-center text-gray-400 py-10">
                          <p className="text-lg font-medium mb-2">{t("booking.noAvailability")}</p>
                          <p className="text-sm">{t("booking.selectAnother")}</p>
                        </div>
                      )}

                      {availabilityData.length > 0 && (
                        <>
                          {groupedSlots.morning.length > 0 && (
                            <div className="mb-8">
                              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-3">
                                {t("booking.morning")}
                              </h3>
                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {groupedSlots.morning.map(renderSlot)}
                              </div>
                            </div>
                          )}

                          {groupedSlots.afternoon.length > 0 && (
                            <div className="mb-8">
                              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-3">
                                {t("booking.afternoon")}
                              </h3>
                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {groupedSlots.afternoon.map(renderSlot)}
                              </div>
                            </div>
                          )}

                          {groupedSlots.evening.length > 0 && (
                            <div>
                              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-3">
                                {t("booking.evening")}
                              </h3>
                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {groupedSlots.evening.map(renderSlot)}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {selectedTime && (
                    <button
                      onClick={() => next("client")}
                      className="w-full rounded-full bg-copper py-2.5 text-sm font-semibold text-white transition hover:brightness-95 sm:text-base"
                    >
                      {t("common.continue")}
                    </button>
                  )}

                  <button
                    onClick={() => setStep("date")}
                    className="text-sm text-gray-400 transition hover:text-white"
                  >
                    {t("common.back")}
                  </button>
                </motion.div>
              )}

              {step === "client" && (
                <motion.div
                  key="client"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5 sm:space-y-6"
                >
                  <p className="text-sm font-semibold sm:text-base">
                    {selectedService?.name} - {formatDay(selectedDate)} {t("booking.at")}{" "}
                    {selectedTime}
                  </p>

                  <p className="text-xs text-gray-400 sm:text-sm">
                    {t("booking.youAreBooking")}{" "}
                    <span className="text-white font-medium">{selectedService?.name}</span>
                  </p>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()

                      const form = e.target as HTMLFormElement

                      await onSubmit({
                        serviceId: selectedService!.id,
                        date: selectedDate,
                        start_time: selectedTime,
                        client_name: (form.elements.namedItem("name") as HTMLInputElement).value,
                        client_email: (form.elements.namedItem("email") as HTMLInputElement).value,
                      })
                    }}
                    className="space-y-3 sm:space-y-4"
                  >
                    <input
                      name="name"
                      placeholder={t("booking.yourName")}
                      required
                      className="w-full rounded-xl border border-white/10 bg-ashSoft/90 p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-copper sm:text-base"
                    />

                    <input
                      name="email"
                      type="email"
                      placeholder={t("booking.yourEmail")}
                      required
                      className="w-full rounded-xl border border-white/10 bg-ashSoft/90 p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-copper sm:text-base"
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-full bg-copper py-2.5 text-sm font-semibold text-white transition hover:brightness-95 sm:text-base"
                    >
                      {isSubmitting ? t("booking.booking") : t("booking.confirm")}
                    </button>
                  </form>

                  <button
                    onClick={() => setStep("time")}
                    className="text-sm text-gray-400 transition hover:text-white"
                  >
                    {t("common.back")}
                  </button>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 text-center sm:space-y-5"
                >
                  <h2 className="flex items-center justify-center gap-2 text-xl font-bold sm:text-2xl">
                    <CheckCircle2 className="h-6 w-6 text-copper" aria-hidden="true" />
                    {t("booking.confirmed")}
                  </h2>

                  <p>{selectedService?.name}</p>

                  <p>
                    {formatDay(selectedDate)} {t("booking.at")} {selectedTime}
                  </p>

                  <button
                    onClick={() => {
                      setStep("service")
                      setSelectedService(null)
                      setSelectedDate("")
                      setSelectedTime("")
                      setConfirmation(null)
                    }}
                    className="mt-4 rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:bg-white/5 sm:text-base"
                  >
                    {t("booking.anotherShort")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-white/10 bg-[#1f201b]/80 p-5 shadow-xl shadow-black/20">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">
                {t("booking.summaryTitle")}
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-[11px] text-gray-600 uppercase tracking-[0.2em]">
                    {t("booking.step.service")}
                  </p>
                  <p className="text-sm font-semibold text-white/90">{summaryService}</p>
                  <p className="text-xs text-gray-500">{summaryDuration}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-600 uppercase tracking-[0.2em]">
                    {t("booking.step.date")}
                  </p>
                  <p className="text-sm font-semibold text-white/90">{summaryDate}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-600 uppercase tracking-[0.2em]">
                    {t("booking.step.time")}
                  </p>
                  <p className="text-sm font-semibold text-white/90">{summaryTime}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                  {t("booking.total")}
                </span>
                <span className="text-sm font-semibold text-white/90">{summaryPrice}</span>
              </div>
            </div>
          </aside>
        </div>
      </motion.div>
    </div>
  )
}
