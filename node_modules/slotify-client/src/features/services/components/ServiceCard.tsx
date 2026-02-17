import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteService } from "../api/services.api"

export default function ServiceCard({ service }: any) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: deleteService,
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

      <button
        onClick={() => mutation.mutate(service.id)}
        className="text-red-500"
      >
        Delete
      </button>
    </div>
  )
}
