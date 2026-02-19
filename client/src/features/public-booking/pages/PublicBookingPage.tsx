import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getPublicServices, getPublicBusiness } from "../api/public.api"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getAvailability } from "../api/public.api"
import { createBooking } from "../api/public.api"
import { useToast } from "../../../components/ui/toast/useToast"
import { api } from "../../../lib/axios"
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
        queryFn: () =>
            getAvailability(slug!, selectedService!.id, selectedDate),
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
            addToast("Booking confirmed successfully")
            setStep("success")
        } catch {
            addToast("Failed to create booking", "error")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = async () => {
        await api.post(`/public/cancel/${confirmation?.cancel_token}`)
        setConfirmation(null)
        alert("Booking cancelled")
    }

    const steps = [
        { key: "service", label: "Service" },
        { key: "date", label: "Date" },
        { key: "time", label: "Time" },
        { key: "client", label: "Details" },
    ] as const

    const summaryService = selectedService?.name ?? "Select a service"
    const summaryDuration = selectedService ? `${selectedService.duration_minutes} min` : "—"
    const summaryPrice = selectedService ? `EUR ${selectedService.price}` : "—"
    const summaryDate = selectedDate || "Pick a date"
    const summaryTime = selectedTime || "Pick a time"

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
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-copper/20 text-4xl sm:mb-5">
                        🎉
                    </div>

                    <h1 className="mb-3 text-2xl font-bold sm:text-3xl">
                        Booking Confirmed
                    </h1>

                    <p className="mx-auto mb-6 max-w-sm text-sm text-gray-300 sm:mb-8 sm:text-base">
                        Your reservation has been successfully scheduled.
                    </p>

                    <div className="mb-6 rounded-2xl border border-white/10 bg-ashSoft/90 px-4 py-5 sm:mb-8 sm:px-6 sm:py-6">
                        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-gray-400 sm:text-sm">
                            Booking Code
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
                            Copy Code
                        </button>

                        <button
                            onClick={handleCancel}
                            className="text-sm text-red-400 transition hover:text-red-300 sm:text-base"
                        >
                            Cancel this booking
                        </button>

                        <button
                            onClick={() => window.location.reload()}
                            className="text-sm text-gray-400 transition hover:text-white sm:text-base"
                        >
                            Book another appointment
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
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "48px 48px",
                }} />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative mx-auto w-full max-w-4xl rounded-2xl border border-white/5 bg-[#262722]/90 p-5 text-white shadow-2xl backdrop-blur-sm sm:rounded-3xl sm:p-8 lg:p-10"
            >
                <div className="mb-8 text-center">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">
                        Book an appointment
                    </p>
                    <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                        {businessQuery.data?.name}
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Choose a service, pick a date, and confirm.
                    </p>
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
                                        Summary
                                    </p>
                                    <p className="text-sm font-semibold text-white/90">
                                        {summaryService}
                                    </p>
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
                                                    <p className="text-sm font-semibold sm:text-base">
                                                        {service.name}
                                                    </p>
                                                    <p className="text-xs text-white/70 sm:text-sm">
                                                        Duration {service.duration_minutes} min
                                                    </p>
                                                </div>
                                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                                                    EUR {service.price}
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
                            Selected: {selectedService?.name}
                        </p>

                        <input
                            type="date"
                            value={selectedDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-ashSoft/90 p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-copper sm:text-base"
                        />

                        {availabilityQuery.isLoading && (
                            <p className="text-gray-500">Checking availability...</p>
                        )}

                        {availabilityQuery.data?.slots?.length === 0 &&
                            selectedDate && (
                                <p className="text-red-500">
                                    No available slots for this date.
                                </p>
                            )}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <button
                                onClick={() => setStep("service")}
                                className="self-start text-sm text-gray-400 transition hover:text-white"
                            >
                                Back
                            </button>

                            {availabilityQuery.data?.slots?.length > 0 && (
                                <button
                                    onClick={() => {
                                        setAvailableSlots(availabilityData ?? [])
                                        next("time")
                                    }}
                                    className="w-full rounded-full bg-copper px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 sm:w-auto sm:text-base"
                                >
                                    Continue
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
                            {selectedService?.name} - {selectedDate}
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
                                <p className="text-lg font-medium mb-2">
                                    No availability for this date
                                </p>
                                <p className="text-sm">
                                    Please select another day.
                                </p>
                            </div>
                        )}

                        {availabilityData.length > 0 && (
                            <>
                                {groupedSlots.morning.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-3">Morning</h3>
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                            {groupedSlots.morning.map(renderSlot)}
                                        </div>
                                    </div>
                                )}

                                {groupedSlots.afternoon.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-3">Afternoon</h3>
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                            {groupedSlots.afternoon.map(renderSlot)}
                                        </div>
                                    </div>
                                )}

                                {groupedSlots.evening.length > 0 && (
                                    <div>
                                        <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-3">Evening</h3>
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
                                Continue
                            </button>
                        )}

                        <button
                            onClick={() => setStep("date")}
                            className="text-sm text-gray-400 transition hover:text-white"
                        >
                            Back
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
                            {selectedService?.name} - {selectedDate} at {selectedTime}
                        </p>

                        <p className="text-xs text-gray-400 sm:text-sm">
                            You are booking:{" "}
                            <span className="text-white font-medium">
                                {selectedService?.name}
                            </span>
                        </p>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault()

                                const form = e.target as HTMLFormElement

                                await onSubmit({
                                    serviceId: selectedService!.id,
                                    date: selectedDate,
                                    start_time: selectedTime,
                                    client_name: (form.elements.namedItem('name') as HTMLInputElement).value,
                                    client_email: (form.elements.namedItem('email') as HTMLInputElement).value,
                                })
                            }}
                            className="space-y-3 sm:space-y-4"
                        >
                            <input
                                name="name"
                                placeholder="Your name"
                                required
                                className="w-full rounded-xl border border-white/10 bg-ashSoft/90 p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-copper sm:text-base"
                            />

                            <input
                                name="email"
                                type="email"
                                placeholder="Your email"
                                required
                                className="w-full rounded-xl border border-white/10 bg-ashSoft/90 p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-copper sm:text-base"
                            />

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-full bg-copper py-2.5 text-sm font-semibold text-white transition hover:brightness-95 sm:text-base"
                            >
                                {isSubmitting
                                    ? "Booking..."
                                    : "Confirm Booking"}
                            </button>
                        </form>

                        <button
                            onClick={() => setStep("time")}
                            className="text-sm text-gray-400 transition hover:text-white"
                        >
                            Back
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
                        <h2 className="text-xl font-bold sm:text-2xl">
                            🎉 Booking Confirmed
                        </h2>

                        <p>
                            {selectedService?.name}
                        </p>

                        <p>
                            {selectedDate} at {selectedTime}
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
                            Book Another
                        </button>
                    </motion.div>
                )}

                        </AnimatePresence>
                    </div>

                    <aside className="hidden lg:block">
                        <div className="sticky top-24 rounded-2xl border border-white/10 bg-[#1f201b]/80 p-5 shadow-xl shadow-black/20">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">
                                Booking summary
                            </p>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <p className="text-[11px] text-gray-600 uppercase tracking-[0.2em]">Service</p>
                                    <p className="text-sm font-semibold text-white/90">{summaryService}</p>
                                    <p className="text-xs text-gray-500">{summaryDuration}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-600 uppercase tracking-[0.2em]">Date</p>
                                    <p className="text-sm font-semibold text-white/90">{summaryDate}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-600 uppercase tracking-[0.2em]">Time</p>
                                    <p className="text-sm font-semibold text-white/90">{summaryTime}</p>
                                </div>
                            </div>
                            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                                    Total
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
