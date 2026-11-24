import Logo from "../../../components/ui/Logo"
import { useForm } from "react-hook-form"
import { LoginFormData } from "../schemas"
import { login } from "../api/auth.api"
import { Link, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { useToast } from "../../../components/ui/toast/useToast"
import { getApiErrorMessage } from "@/lib/apiError"
import { useI18n } from "@/lib/i18n/useI18n"

export default function LoginPage() {
  const navigate = useNavigate()
  const [loginError, setLoginError] = useState<string | null>(null)
  // Set by the axios interceptor when a session was rejected (expired token / demo sandbox).
  // A timestamp (not a one-shot flag): the redirect can mount this page twice in a row.
  const [sessionEnded] = useState(() => {
    const at = Number(sessionStorage.getItem("slotify-session-ended"))
    return at > 0 && Date.now() - at < 30_000
  })
  const { addToast } = useToast()
  const { t } = useI18n()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token)
      sessionStorage.removeItem("slotify-session-ended")
      setLoginError(null)
      navigate("/dashboard")
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error, t, "auth.login.failed")

      setLoginError(message)
      addToast(message, "error")
    },
    retry: false,
  })

  const onSubmit = (data: LoginFormData) => {
    setLoginError(null)
    mutation.mutate(data)
  }

  return (
    <div className="w-full max-w-3xl rounded-3xl border border-white/5 bg-[#262722]/90 p-8 text-white shadow-2xl backdrop-blur-sm sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div>
          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-copper/30 bg-gradient-to-br from-copper/25 to-copper/5 text-copper lg:mx-0">
              <Logo className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gray-500">
              {t("auth.login.eyebrow")}
            </p>
            <h2 className="mt-2 text-2xl font-bold">{t("auth.login.title")}</h2>
            <p className="mt-2 text-sm text-gray-400">{t("auth.login.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {sessionEnded && !loginError && (
              <p
                role="status"
                className="rounded-lg border border-copper/30 bg-copper/10 p-3 text-sm text-copper"
              >
                {t("auth.login.sessionEnded")}
              </p>
            )}

            {loginError && (
              <p className="text-red-400 text-sm rounded-lg bg-red-400/10 border border-red-400/20 p-3">
                {loginError}
              </p>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                {t("common.email")}
              </label>
              <input
                {...register("email", {
                  required: t("validation.emailRequired"),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t("validation.emailInvalid"),
                  },
                })}
                type="email"
                placeholder="you@company.com"
                className="w-full rounded-xl border border-white/10 bg-ashSoft/90 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-copper"
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                {t("common.password")}
              </label>
              <input
                {...register("password", {
                  required: t("validation.passwordRequired"),
                  minLength: {
                    value: 6,
                    message: t("validation.passwordMin"),
                  },
                })}
                type="password"
                placeholder={t("auth.login.passwordPlaceholder")}
                className="w-full rounded-xl border border-white/10 bg-ashSoft/90 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-copper"
              />
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-full bg-copper py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? t("auth.login.submitting") : t("auth.login.submit")}
            </button>

            <div className="pt-2 text-center lg:text-left">
              <p className="text-xs text-gray-500">
                {t("auth.login.noAccount")}{" "}
                <Link to="/register" className="text-copper hover:underline">
                  {t("auth.login.createOne")}
                </Link>
              </p>
            </div>
          </form>
        </div>

        <aside className="hidden lg:flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gray-600">
              {t("auth.login.aside.eyebrow")}
            </p>
            <p className="mt-3 text-sm font-semibold text-white/90">
              {t("auth.login.aside.title")}
            </p>
            <p className="mt-2 text-sm text-gray-400">{t("auth.login.aside.text")}</p>
          </div>
          <div className="mt-6 space-y-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-copper/70" />
              {t("auth.login.aside.b1")}
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-copper/70" />
              {t("auth.login.aside.b2")}
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-copper/70" />
              {t("auth.login.aside.b3")}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
