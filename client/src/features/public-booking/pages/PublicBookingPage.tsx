import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getPublicServices } from "../api/public.api"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getAvailability } from "../api/public.api"
import { useMutation } from "@tanstack/react-query"
import { createBooking } from "../api/public.api"

type Step = "service" | "date" | "time" | "client" | "success"

export default function PublicBookingPage() {
    const { businessId } = useParams()

    const [step, setStep] = useState<Step>("service")
    const [selectedService, setSelectedService] = useState<any>(null)

    const [selectedDate, setSelectedDate] = useState<string>("")
    const [availableSlots, setAvailableSlots] = useState<string[]>([])

    const { data: services } = useQuery({
        queryKey: ["public-services", businessId],
        queryFn: () => getPublicServices(businessId!),
    })

    const availabilityQuery = useQuery({
        queryKey: ["availability", businessId, selectedService?.id, selectedDate],
        queryFn: () =>
            getAvailability(businessId!, selectedService.id, selectedDate),
        enabled: !!selectedService && !!selectedDate,
    })

    const next = (nextStep: Step) => setStep(nextStep)
    const back = () => setStep("service")

    const [selectedTime, setSelectedTime] = useState<string>("")

    const [bookingSuccess, setBookingSuccess] = useState<any>(null)

    const bookingMutation = useMutation({
        mutationFn: (data: any) =>
            createBooking(businessId!, data),
        onSuccess: (data) => {
            setBookingSuccess(data)
            setStep("success")
        },
    })

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-center">
                Book an Appointment
            </h1>

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
                        {services?.map((service: any) => (
                            <button
                                key={service.id}
                                onClick={() => {
                                    setSelectedService(service)
                                    next("date")
                                }}
                                className="w-full p-4 border rounded hover:bg-gray-50"
                            >
                                <div className="font-bold">{service.name}</div>
                                <div className="text-sm text-gray-500">
                                    {service.duration_minutes} min — ${service.price}
                                </div>
                            </button>
                        ))}
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
                            className="border p-2 rounded w-full"
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
                                className="bg-black text-white px-4 py-2 rounded"
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
                                            ? "bg-black text-white"
                                            : "hover:bg-gray-100"
                                        }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>

                        {selectedTime && (
                            <button
                                onClick={() => next("client")}
                                className="w-full bg-black text-white py-2 rounded"
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
                                className="w-full border p-2 rounded"
                            />

                            <input
                                name="email"
                                type="email"
                                placeholder="Your email"
                                required
                                className="w-full border p-2 rounded"
                            />

                            {bookingMutation.isError && (
                                <p className="text-red-500">
                                    Something went wrong. Try again.
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={bookingMutation.isPending}
                                className="w-full bg-black text-white py-2 rounded"
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
        </div>
    )
}
