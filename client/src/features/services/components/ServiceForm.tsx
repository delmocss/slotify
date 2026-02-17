import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { serviceSchema, ServiceFormData } from "../schemas"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createService } from "../api/services.api"

export default function ServiceForm() {
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset } =
    useForm<ServiceFormData>({
      resolver: zodResolver(serviceSchema),
    })

  const mutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      reset()
    },
  })

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="bg-surface border border-white/5 rounded-xl p-6 space-y-3"
    >
      <input
        {...register("name")}
        placeholder="Service name"
        className="w-full bg-ashSoft border border-white/10 text-white p-2 rounded-md focus:ring-2 focus:ring-copper"
      />

      <input
        {...register("duration_minutes", { valueAsNumber: true })}
        type="number"
        placeholder="Duration (minutes)"
        className="w-full bg-ashSoft border border-white/10 text-white p-2 rounded-md focus:ring-2 focus:ring-copper"
      />

      <input
        {...register("price", { valueAsNumber: true })}
        type="number"
        placeholder="Price"
        className="w-full bg-ashSoft border border-white/10 text-white p-2 rounded-md focus:ring-2 focus:ring-copper"
      />

      <button
        type="submit"
        className="bg-copper text-white hover:brightness-95 transition p-2 rounded w-full"
      >
        Create Service
      </button>
    </form>
  )
}
