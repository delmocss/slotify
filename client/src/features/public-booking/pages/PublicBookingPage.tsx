import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getPublicServices } from "../api/public.api"
import { useState } from "react"

export default function PublicBookingPage() {
  const { businessId } = useParams()
  const [selectedService, setSelectedService] = useState<any>(null)

  const { data: services } = useQuery({
    queryKey: ["public-services", businessId],
    queryFn: () => getPublicServices(businessId!),
  })

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">
        Book an Appointment
      </h1>

      {!selectedService && (
        <div className="space-y-3">
          {services?.map((service: any) => (
            <button
              key={service.id}
              onClick={() => setSelectedService(service)}
              className="w-full p-4 border rounded hover:bg-gray-50"
            >
              <div className="font-bold">{service.name}</div>
              <div className="text-sm text-gray-500">
                {service.duration_minutes} min — ${service.price}
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedService && (
        <div>
          <p className="font-semibold">
            Selected: {selectedService.name}
          </p>
          {/* Next steps aquí */}
        </div>
      )}
    </div>
  )
}
