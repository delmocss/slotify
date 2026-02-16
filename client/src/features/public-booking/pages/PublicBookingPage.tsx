import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getPublicServices } from "../api/public.api"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Step = "service" | "date" | "time" | "client" | "success"

export default function PublicBookingPage() {
  const { businessId } = useParams()

  const [step, setStep] = useState<Step>("service")
  const [selectedService, setSelectedService] = useState<any>(null)

  const { data: services } = useQuery({
    queryKey: ["public-services", businessId],
    queryFn: () => getPublicServices(businessId!),
  })

  const next = (nextStep: Step) => setStep(nextStep)
  const back = () => setStep("service")

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
          >
            <p className="mb-4 font-semibold">
              Selected: {selectedService?.name}
            </p>

            <button
              onClick={() => next("time")}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Continue (Next Step Placeholder)
            </button>

            <button
              onClick={back}
              className="ml-4 text-gray-500"
            >
              Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
