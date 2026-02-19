import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, RegisterFormData } from "../schemas"
import { register as registerApi } from "../api/auth.api"
import { Link, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"

export default function RegisterPage() {
  const navigate = useNavigate()

  const { register, handleSubmit } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const mutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token)
      navigate("/dashboard")
    },
  })

  return (
    <div className="w-full max-w-3xl rounded-3xl border border-white/5 bg-[#262722]/90 p-8 text-white shadow-2xl backdrop-blur-sm sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div>
          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-semibold text-white/70 lg:mx-0">
              S
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gray-500">
              Get started
            </p>
            <h2 className="mt-2 text-2xl font-bold">Create your account</h2>
            <p className="mt-2 text-sm text-gray-400">
              Set up your business in minutes.
            </p>
          </div>

          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Business name
              </label>
              <input
                {...register("name")}
                placeholder="Studio Aurora"
                className="w-full rounded-xl border border-white/10 bg-ashSoft/90 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-copper"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@company.com"
                className="w-full rounded-xl border border-white/10 bg-ashSoft/90 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-copper"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="Create a password"
                className="w-full rounded-xl border border-white/10 bg-ashSoft/90 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-copper"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-copper py-3 text-sm font-semibold text-white transition hover:brightness-95"
            >
              Create Account
            </button>

            <div className="pt-2 text-center lg:text-left">
              <p className="text-xs text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="text-copper hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>

        <aside className="hidden lg:flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gray-600">
              What you get
            </p>
            <p className="mt-3 text-sm font-semibold text-white/90">
              A polished booking flow.
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Launch quickly with a clean UI that clients trust and love.
            </p>
          </div>
          <div className="mt-6 space-y-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-copper/70" />
              Custom services and availability
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-copper/70" />
              Public booking link
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-copper/70" />
              Clear client confirmations
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
