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
        {...register("duration_minutes", { 
          valueAsNumber: true,
          onChange: (e) => {
            const value = parseInt(e.target.value)
            if (value < 1) e.target.value = "1"
          }
        })}
        type="number"
        min="1"
        step="1"
        placeholder="Duration (minutes)"
        onKeyDown={(e) => {
          if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
            e.preventDefault()
          }
        }}
        className="w-full bg-ashSoft border border-white/10 text-white p-2 rounded-md focus:ring-2 focus:ring-copper"
      />

      <input
        {...register("price", { 
          valueAsNumber: true,
          onChange: (e) => {
            const value = parseFloat(e.target.value)
            if (value < 0) e.target.value = "0"
          }
        })}
        type="number"
        min="0"
        step="0.01"
        placeholder="Price"
        onKeyDown={(e) => {
          if (e.key === '-' || e.key === 'e' || e.key === 'E') {
            e.preventDefault()
          }
        }}
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
