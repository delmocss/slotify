import { useQuery } from "@tanstack/react-query"
import { Scissors } from "lucide-react"
import { getServices } from "../api/services.api"
import ServiceForm from "../components/ServiceForm"
import ServiceCard from "../components/ServiceCard"
import Skeleton from "@/components/ui/Skeleton"
import { getApiErrorMessage } from "@/lib/apiError"
import { Service } from "@/types"

export default function ServicesPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: getServices,
  })

  return (
    <div className="space-y-6 text-white">
      <div>
        <h2 className="text-2xl font-bold">Services</h2>
        <p className="mt-1 text-sm text-gray-400">
          What your clients can book. Inactive services are hidden from your public page.
        </p>
      </div>

      <ServiceForm />

      {isLoading ? (
        <div className="grid gap-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-400/20 bg-red-400/5 p-6 text-center"
        >
          <p className="font-medium text-red-200">Could not load your services</p>
          <p className="mt-1 text-sm text-gray-400">{getApiErrorMessage(error)}</p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-200 transition hover:bg-white/[0.06] disabled:opacity-60"
          >
            {isFetching ? "Retrying..." : "Try again"}
          </button>
        </div>
      ) : data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 py-12 text-center text-gray-400">
          <Scissors className="mx-auto mb-3 h-6 w-6 text-gray-500" aria-hidden="true" />
          <p className="mb-1 text-lg text-gray-300">No services yet</p>
          <p className="text-sm">Create your first service using the form above.</p>
        </div>
      )}
    </div>
  )
}
