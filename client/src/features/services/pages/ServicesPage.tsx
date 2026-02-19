import { useQuery } from "@tanstack/react-query"
import { getServices } from "../api/services.api"
import ServiceForm from "../components/ServiceForm"
import ServiceCard from "../components/ServiceCard"
import Skeleton from "@/components/ui/Skeleton"

export default function ServicesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
  })

  if (isLoading) {
    return (
      <div className="grid gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

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
