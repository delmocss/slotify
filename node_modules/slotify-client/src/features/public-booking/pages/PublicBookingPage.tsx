import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getPublicServices, getPublicBusiness } from "../api/public.api"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getAvailability } from "../api/public.api"
import { createBooking } from "../api/public.api"
import { useToast } from "../../../components/ui/toast/useToast"
import { api } from "../../../lib/axios"

type Step = "service" | "date" | "time" | "client" | "success"

export default function PublicBookingPage() {
    const { slug } = useParams()
    const { addToast } = useToast()

    const [step, setStep] = useState<Step>("service")
    const [selectedService, setSelectedService] = useState<any>(null)

    const [selectedDate, setSelectedDate] = useState<string>("")
    const [availableSlots, setAvailableSlots] = useState<string[]>([])

    const { data: services } = useQuery({
        queryKey: ["public-services", slug],
        queryFn: () => getPublicServices(slug!),
    })

    const availabilityQuery = useQuery({
        queryKey: ["availability", slug, selectedService?.id, selectedDate],
        queryFn: () =>
            getAvailability(slug!, selectedService.id, selectedDate),
        enabled: !!selectedService && !!selectedDate,
    })
    const next = (nextStep: Step) => setStep(nextStep)

    const [selectedTime, setSelectedTime] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const businessQuery = useQuery({
        queryKey: ["public-business", slug],
        queryFn: () => getPublicBusiness(slug!),
    })

    const [confirmation, setConfirmation] = useState<{
    booking_code: string
    cancel_token: string
} | null>(null)

    const onSubmit = async (data: any) => {
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
        <div className="min-h-screen w-full bg-gradient-to-br from-[#2f302c] via-[#3B3C36] to-black px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mx-auto w-full max-w-4xl rounded-2xl border border-white/5 bg-[#2A2B27] p-5 text-white shadow-2xl sm:rounded-3xl sm:p-8 lg:p-10"
            >
                <h1 className="mb-6 text-center text-2xl font-bold leading-tight sm:mb-8 sm:text-3xl lg:text-4xl">
                    {businessQuery.data?.name}
                </h1>

                <div className="mb-6 flex flex-wrap justify-center gap-2 text-xs sm:mb-8 sm:gap-3 sm:text-sm">
                    <span
                        className={`rounded-full px-3 py-1 ${step === "service" ? "bg-copper font-bold text-white" : "bg-white/5 text-white/70"}`}
                    >
                        Service
                    </span>
                    <span
                        className={`rounded-full px-3 py-1 ${step === "date" ? "bg-copper font-bold text-white" : "bg-white/5 text-white/70"}`}
                    >
                        Date
                    </span>
                    <span
                        className={`rounded-full px-3 py-1 ${step === "time" ? "bg-copper font-bold text-white" : "bg-white/5 text-white/70"}`}
                    >
                        Time
                    </span>
                    <span
                        className={`rounded-full px-3 py-1 ${step === "client" ? "bg-copper font-bold text-white" : "bg-white/5 text-white/70"}`}
                    >
                        Details
                    </span>
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
                        <div className="grid gap-3 sm:gap-4">
                            {services?.map((service: any) => (
                                <button
                                    key={service.id}
                                    onClick={() => {
                                        setSelectedService(service)
                                        next("date")
                                    }}
                                    className={`rounded-2xl border p-4 text-left transition-all duration-200 hover:scale-[1.01] sm:p-5 md:p-6 ${
                                        selectedService?.id === service.id
                                            ? "border-white/30 bg-ashSoft/80 text-white"
                                            : "border-white/10 bg-ashSoft/80 text-white hover:bg-ashSoft"
                                    }`}
                                >
                                    <p className="text-sm font-semibold sm:text-base">{service.name}</p>
                                    <p className="text-xs text-white/70 sm:text-sm">
                                        {service.duration_minutes} min
                                    </p>
                                    <p className="mt-2 text-sm font-medium">
                                        €{service.price}
                                    </p>
                                </button>
                            ))}
                        </div>
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
                            className="w-full rounded-md border border-white/10 bg-ashSoft p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-copper sm:text-base"
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
                                        setAvailableSlots(availabilityQuery.data.slots)
                                        next("time")
                                    }}
                                    className="w-full rounded-lg bg-copper px-4 py-2.5 text-sm text-white transition hover:brightness-95 sm:w-auto sm:text-base"
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
                            {selectedService?.name} — {selectedDate}
                        </p>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4">
                            {availableSlots.map((slot) => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedTime(slot)}
                                    className={`rounded border px-3 py-2.5 text-sm transition sm:p-3 sm:text-base 
            ${selectedTime === slot
                                            ? "bg-copper text-white"
                                            : "bg-ashSoft hover:bg-ash border border-white/5 text-white"
                                        }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>

                        {selectedTime && (
                            <button
                                onClick={() => next("client")}
                                className="w-full rounded-lg bg-copper py-2.5 text-sm text-white transition hover:brightness-95 sm:text-base"
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
                            {selectedService?.name} — {selectedDate} at {selectedTime}
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

                                const form = e.target as any

                                await onSubmit({
                                    serviceId: selectedService.id,
                                    date: selectedDate,
                                    start_time: selectedTime,
                                    client_name: form.name.value,
                                    client_email: form.email.value,
                                })
                            }}
                            className="space-y-3 sm:space-y-4"
                        >
                            <input
                                name="name"
                                placeholder="Your name"
                                required
                                className="w-full rounded-md border border-white/10 bg-ashSoft p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-copper sm:text-base"
                            />

                            <input
                                name="email"
                                type="email"
                                placeholder="Your email"
                                required
                                className="w-full rounded-md border border-white/10 bg-ashSoft p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-copper sm:text-base"
                            />

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-lg bg-copper py-2.5 text-sm text-white transition hover:brightness-95 sm:text-base"
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
            </motion.div>
        </div>
    )
}
