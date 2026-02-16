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
      className="bg-white p-4 shadow rounded space-y-3"
    >
      <input
        {...register("name")}
        placeholder="Service name"
        className="w-full border p-2 rounded"
      />

      <input
        {...register("duration_minutes", { valueAsNumber: true })}
        type="number"
        placeholder="Duration (minutes)"
        className="w-full border p-2 rounded"
      />

      <input
        {...register("price", { valueAsNumber: true })}
        type="number"
        placeholder="Price"
        className="w-full border p-2 rounded"
      />

      <button
        type="submit"
        className="bg-black text-white p-2 rounded w-full"
      >
        Create Service
      </button>
    </form>
  )
}
