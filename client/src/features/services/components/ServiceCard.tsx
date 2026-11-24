import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Clock, Loader2, Pencil, Trash2 } from "lucide-react"
import { deleteService, toggleService } from "../api/services.api"
import ServiceForm from "./ServiceForm"
import { useToast } from "@/components/ui/toast/useToast"
import { getApiErrorMessage } from "@/lib/apiError"
import { Service } from "@/types"

interface ServiceCardProps {
  service: Service
}

const priceFormat = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" })

export default function ServiceCard({ service }: ServiceCardProps) {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["services"] })

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      refresh()
      addToast(`"${service.name}" deleted`)
    },
    onError: (error) => {
      setConfirmingDelete(false)
      addToast(getApiErrorMessage(error, "Could not delete the service."), "error")
    },
  })

  const toggleMutation = useMutation({
    mutationFn: toggleService,
    onSuccess: (updated) => {
      refresh()
      addToast(`"${service.name}" is now ${updated.is_active ? "active" : "inactive"}`)
    },
    onError: (error) => {
      addToast(getApiErrorMessage(error, "Could not change the service status."), "error")
    },
  })

  if (editing) {
    return (
      <ServiceForm
        service={service}
        onDone={() => setEditing(false)}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/5 bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className={service.is_active ? "" : "opacity-60"}>
        <h3 className="font-semibold text-white">{service.name}</h3>
        <p className="mt-1 flex items-center gap-3 text-sm text-gray-400">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {service.duration_minutes} min
          </span>
          <span className="text-gray-600">•</span>
          <span>{priceFormat.format(Number(service.price))}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => toggleMutation.mutate(service.slug)}
          disabled={toggleMutation.isPending}
          aria-pressed={service.is_active}
          title={service.is_active ? "Click to deactivate" : "Click to activate"}
          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
            service.is_active
              ? "border-green-500/30 bg-green-500/10 text-green-300 hover:bg-green-500/20"
              : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          {toggleMutation.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          ) : (
            <span
              className={`h-1.5 w-1.5 rounded-full ${service.is_active ? "bg-green-400" : "bg-gray-500"}`}
            />
          )}
          {service.is_active ? "Active" : "Inactive"}
        </button>

        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-300 transition hover:bg-white/[0.06] hover:text-white"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          Edit
        </button>

        {confirmingDelete ? (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-1.5">
            <span className="text-xs text-amber-200">Delete? Its bookings are removed too.</span>
            <button
              onClick={() => deleteMutation.mutate(service.id)}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              )}
              Yes, delete
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              disabled={deleteMutation.isPending}
              className="text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
