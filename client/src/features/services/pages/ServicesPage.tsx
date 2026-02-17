import { useQuery } from "@tanstack/react-query"
import { getServices } from "../api/services.api"
import ServiceForm from "../components/ServiceForm"
import ServiceCard from "../components/ServiceCard"

export default function ServicesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-6 text-white">
      <h2 className="text-2xl font-bold">Services</h2>

      <ServiceForm />

      <div className="space-y-3">
        {data?.map((service: any) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  )
}
