import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Plus, Save } from "lucide-react"
import { useMemo } from "react"
import { createServiceSchema, ServiceFormData } from "../schemas"
import { createService, updateService } from "../api/services.api"
import { useToast } from "@/components/ui/toast/useToast"
import { getApiErrorMessage, getApiStatus } from "@/lib/apiError"
import { useI18n } from "@/lib/i18n/useI18n"
import { Service } from "@/types"

type Props = {
  /** When provided the form edits this service instead of creating a new one. */
  service?: Service
  onDone?: () => void
  onCancel?: () => void
}

const inputBase =
  "w-full rounded-md border bg-ashSoft p-2.5 text-white placeholder-gray-500 transition focus:outline-none focus:ring-2"

function inputClass(hasError: boolean, extra = "") {
  return `${inputBase} ${extra} ${
    hasError ? "border-red-400/60 focus:ring-red-400/60" : "border-white/10 focus:ring-copper"
  }`
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-red-300">
      {message}
    </p>
  )
}

// Block characters that cannot be part of a plain positive number.
function blockInvalidKeys(allowDecimal: boolean) {
  return (e: React.KeyboardEvent<HTMLInputElement>) => {
    const blocked = ["-", "+", "e", "E", ...(allowDecimal ? [] : [".", ","])]
    if (blocked.includes(e.key)) e.preventDefault()
  }
}

export default function ServiceForm({ service, onDone, onCancel }: Props) {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const { t, locale } = useI18n()
  const serviceSchema = useMemo(() => createServiceSchema(t, locale), [t, locale])
  const isEdit = !!service
  const uid = service?.id ?? "new"

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service
      ? {
          name: service.name,
          duration_minutes: service.duration_minutes,
          price: Number(service.price),
        }
      : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: ServiceFormData) =>
      isEdit ? updateService(service.id, data) : createService(data),
    onSuccess: (_result, data) => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      addToast(t(isEdit ? "services.updated" : "services.created", { name: data.name }))
      if (!isEdit) {
        // "" (not undefined) is what actually empties a number input.
        reset({
          name: "",
          duration_minutes: "" as unknown as number,
          price: "" as unknown as number,
        })
        setFocus("name")
      }
      onDone?.()
    },
    onError: (error) => {
      const message = getApiErrorMessage(error, t, "services.saveFailed")
      // A duplicate name belongs to the name field; anything else is a toast.
      if (getApiStatus(error) === 409) {
        setError("name", { message })
        setFocus("name")
      } else {
        addToast(message, "error")
      }
    },
  })

  const pending = mutation.isPending

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      noValidate
      className="space-y-4 rounded-xl border border-white/5 bg-surface p-4 sm:p-6"
    >
      {!isEdit && (
        <div>
          <h3 className="text-base font-semibold text-white">{t("services.new")}</h3>
          <p className="text-sm text-gray-400">{t("services.newHint")}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr,1fr,1fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor={`name-${uid}`} className="mb-1.5 block text-sm text-gray-300">
            {t("services.name")}
          </label>
          <input
            id={`name-${uid}`}
            {...register("name")}
            placeholder={t("services.namePlaceholder")}
            maxLength={80}
            autoComplete="off"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `name-error-${uid}` : undefined}
            className={inputClass(!!errors.name)}
          />
          <FieldError id={`name-error-${uid}`} message={errors.name?.message} />
        </div>

        <div>
          <label htmlFor={`duration-${uid}`} className="mb-1.5 block text-sm text-gray-300">
            {t("services.duration")}
          </label>
          <div className="relative">
            <input
              id={`duration-${uid}`}
              {...register("duration_minutes", { valueAsNumber: true })}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              placeholder="30"
              onKeyDown={blockInvalidKeys(false)}
              aria-invalid={!!errors.duration_minutes}
              aria-describedby={errors.duration_minutes ? `duration-error-${uid}` : undefined}
              className={inputClass(!!errors.duration_minutes, "pr-12")}
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">
              {t("services.minUnit")}
            </span>
          </div>
          <FieldError id={`duration-error-${uid}`} message={errors.duration_minutes?.message} />
        </div>

        <div>
          <label htmlFor={`price-${uid}`} className="mb-1.5 block text-sm text-gray-300">
            {t("services.price")}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-gray-500">
              €
            </span>
            <input
              id={`price-${uid}`}
              {...register("price", { valueAsNumber: true })}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              onKeyDown={blockInvalidKeys(true)}
              aria-invalid={!!errors.price}
              aria-describedby={errors.price ? `price-error-${uid}` : undefined}
              className={inputClass(!!errors.price, "pl-8")}
            />
          </div>
          <FieldError id={`price-error-${uid}`} message={errors.price?.message} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 sm:w-auto text-sm font-semibold text-[#1a1b17] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : isEdit ? (
            <Save className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4" aria-hidden="true" />
          )}
          {pending ? t("services.saving") : isEdit ? t("services.save") : t("services.create")}
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 sm:flex-none transition hover:bg-white/[0.05] disabled:opacity-60"
          >
            {t("common.cancel")}
          </button>
        )}
      </div>
    </form>
  )
}
