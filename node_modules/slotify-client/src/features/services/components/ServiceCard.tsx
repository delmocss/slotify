import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteService, toggleService } from "../api/services.api"
import { Service } from "@/types"

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: toggleService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
    },
  })

  return (
    <div className="bg-surface border border-white/5 rounded-xl p-6 flex justify-between items-center">
      <div>
        <h3 className="font-bold text-white">{service.name}</h3>
        <p className="text-sm text-gray-400">
          {service.duration_minutes} min — ${service.price}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => toggleMutation.mutate(service.slug)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            service.is_active
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-600 text-white hover:bg-gray-700"
          }`}
        >
          {service.is_active ? "Active" : "Inactive"}
        </button>

        <button
          onClick={() => deleteMutation.mutate(service.id)}
          className="text-red-500 hover:text-red-400"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
