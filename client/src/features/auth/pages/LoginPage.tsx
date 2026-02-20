import { useForm } from "react-hook-form"
import { LoginFormData } from "../schemas"
import { login } from "../api/auth.api"
import { Link, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { useToast } from "../../../components/ui/toast/useToast"
import axios from "axios"

export default function LoginPage() {
  const navigate = useNavigate()
  const [loginError, setLoginError] = useState<string | null>(null)
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token)
      setLoginError(null)
      navigate("/dashboard")
    },
    onError: (error: unknown) => {
      let message = "Login failed. Please check your credentials."
      
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          message = error.response.data.message
        } else if (error.response?.status === 401) {
          message = "Invalid email or password."
        } else if (error.response?.status === 400) {
          message = "Please check your email and password."
        }
      }
      
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
            <div className="mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-semibold text-white/70 lg:mx-0">
              S
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gray-500">
              Welcome back
            </p>
            <h2 className="mt-2 text-2xl font-bold">Login</h2>
            <p className="mt-2 text-sm text-gray-400">
              Access your dashboard and manage your bookings.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {loginError && (
              <p className="text-red-400 text-sm rounded-lg bg-red-400/10 border border-red-400/20 p-3">
                {loginError}
              </p>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Email
              </label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
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
                Password
              </label>
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                type="password"
                placeholder="Your password"
                className="w-full rounded-xl border border-white/10 bg-ashSoft/90 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-copper"
              />
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-full bg-copper py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? "Logging in..." : "Login"}
            </button>

            <div className="pt-2 text-center lg:text-left">
              <p className="text-xs text-gray-500">
                Don&#39;t have an account?{" "}
                <Link to="/register" className="text-copper hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </form>
        </div>

        <aside className="hidden lg:flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gray-600">
              Quick access
            </p>
            <p className="mt-3 text-sm font-semibold text-white/90">
              Your schedule, organized.
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Review upcoming bookings, confirm availability, and keep clients informed.
            </p>
          </div>
          <div className="mt-6 space-y-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-copper/70" />
              Fast sign-in to the dashboard
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-copper/70" />
              Real-time availability tracking
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-copper/70" />
              Clean, client-ready scheduling
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
