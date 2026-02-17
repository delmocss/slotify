import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getPublicServices, getPublicBusiness } from "../api/public.api"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getAvailability } from "../api/public.api"
import { useMutation } from "@tanstack/react-query"
import { createBooking } from "../api/public.api"
import { useToast } from "../../../components/ui/toast/useToast"

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
    console.log("Availability data:", availabilityQuery.data)


    const next = (nextStep: Step) => setStep(nextStep)
    const back = () => setStep("service")

    const [selectedTime, setSelectedTime] = useState<string>("")

    const [bookingSuccess, setBookingSuccess] = useState<any>(null)

    const bookingMutation = useMutation({
        mutationFn: (data: any) => createBooking(slug!, data),
        onSuccess: (data) => {
            addToast("Booking confirmed successfully")
            setStep("success")
            setBookingSuccess(data)
        },
        onError: () => {
            addToast("Failed to create booking", "error")
        }
    })

    const businessQuery = useQuery({
        queryKey: ["public-business", slug],
        queryFn: () => getPublicBusiness(slug!),
    })


    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#2f302c] via-[#3B3C36] to-black flex items-center justify-center px-8 py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-4xl w-full bg-[#2A2B27] p-16 rounded-3xl border border-white/5 shadow-2xl text-white"
            >
                <h1 className="text-4xl font-bold text-center mb-8">
                    {businessQuery.data?.name}
                </h1>

                <div className="flex justify-center gap-4 text-sm">
                    <span className={step === "service" ? "font-bold" : ""}>
                        Service
                    </span>
                    <span className={step === "date" ? "font-bold" : ""}>
                        Date
                    </span>
                    <span className={step === "time" ? "font-bold" : ""}>
                        Time
                    </span>
                    <span className={step === "client" ? "font-bold" : ""}>
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
                        className="space-y-3"
                    >
                        <div className="grid gap-4">
                            {services?.map((service: any) => (
                                <button
                                    key={service.id}
                                    onClick={() => {
                                        setSelectedService(service)
                                        next("date")
                                    }}
                                    className={`border border-white/10 rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02] ${
                                        selectedService?.id === service.id
                                            ? "bg-copper text-white"
                                            : "bg-ashSoft/80 hover:bg-ashSoft text-white"
                                    }`}
                                >
                                    <p className="font-semibold">{service.name}</p>
                                    <p className="text-sm text-white/70">
                                        {service.duration_minutes} min
                                    </p>
                                    <p className="text-sm font-medium mt-2">
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
                        className="space-y-4"
                    >
                        <p className="font-semibold">
                            Selected: {selectedService?.name}
                        </p>

                        <input
                            type="date"
                            value={selectedDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-ashSoft border border-white/10 text-white placeholder-gray-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-copper"
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

                        {availabilityQuery.data?.slots?.length > 0 && (
                            <button
                                onClick={() => {
                                    setAvailableSlots(availabilityQuery.data.slots)
                                    next("time")
                                }}
                                className="bg-copper text-white hover:brightness-95 transition px-4 py-2 rounded"
                            >
                                Continue
                            </button>
                        )}

                        <button
                            onClick={() => setStep("service")}
                            className="text-gray-500"
                        >
                            Back
                        </button>
                    </motion.div>
                )}

                {step === "time" && (
                    <motion.div
                        key="time"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-6"
                    >
                        <p className="font-semibold">
                            {selectedService?.name} — {selectedDate}
                        </p>

                        <div className="grid grid-cols-3 gap-3">
                            {availableSlots.map((slot) => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedTime(slot)}
                                    className={`p-3 rounded border transition 
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
                                className="w-full bg-copper text-white hover:brightness-95 transition py-2 rounded"
                            >
                                Continue
                            </button>
                        )}

                        <button
                            onClick={() => setStep("date")}
                            className="text-gray-500"
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
                        className="space-y-6"
                    >
                        <p className="font-semibold">
                            {selectedService?.name} — {selectedDate} at {selectedTime}
                        </p>

                        <p className="text-gray-400 text-sm">
                            You are booking:{" "}
                            <span className="text-white font-medium">
                                {selectedService?.name}
                            </span>
                        </p>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault()

                                const form = e.target as any

                                bookingMutation.mutate({
                                    serviceId: selectedService.id,
                                    date: selectedDate,
                                    start_time: selectedTime,
                                    client_name: form.name.value,
                                    client_email: form.email.value,
                                })
                            }}
                            className="space-y-4"
                        >
                            <input
                                name="name"
                                placeholder="Your name"
                                required
                                className="w-full bg-ashSoft border border-white/10 text-white placeholder-gray-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-copper"
                            />

                            <input
                                name="email"
                                type="email"
                                placeholder="Your email"
                                required
                                className="w-full bg-ashSoft border border-white/10 text-white placeholder-gray-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-copper"
                            />

                            {bookingMutation.isError && (
                                <p className="text-red-500">
                                    Something went wrong. Try again.
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={bookingMutation.isPending}
                                className="w-full bg-copper text-white hover:brightness-95 transition py-2 rounded"
                            >
                                {bookingMutation.isPending
                                    ? "Booking..."
                                    : "Confirm Booking"}
                            </button>
                        </form>

                        <button
                            onClick={() => setStep("time")}
                            className="text-gray-500"
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
                        className="text-center space-y-4"
                    >
                        <h2 className="text-2xl font-bold">
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
                                setBookingSuccess(null)
                            }}
                            className="mt-4 border px-4 py-2 rounded"
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
