import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, LoginFormData } from "../schemas"
import { login } from "../api/auth.api"
import { Link, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"

export default function LoginPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token)
      navigate("/dashboard")
    },
  })

  const onSubmit = (data: LoginFormData) => {
    mutation.mutate(data)
  }

  return (
    <div className="w-full max-w-lg bg-[#2A2B27] p-12 rounded-3xl shadow-2xl border border-white/5">
      <h2 className="text-2xl font-bold mb-8 text-white">Login</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <input
          {...register("email")}
          placeholder="Email"
          className="w-full bg-ashSoft border border-white/10 text-white placeholder-gray-400 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-copper transition"
        />
        {errors.email && <p className="text-red-500">Invalid email</p>}

        <input
          {...register("password")}
          type="password"
          placeholder="Password"
          className="w-full bg-ashSoft border border-white/10 text-white placeholder-gray-400 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-copper transition"
        />
        {errors.password && (
          <p className="text-red-500">Invalid password</p>
        )}

        <button
          type="submit"
          className="w-full bg-copper text-white py-4 rounded-xl font-semibold tracking-wide hover:brightness-95 transition-all duration-200"
        >
          Login
        </button>

        <p className="text-sm text-gray-400 text-center">
          Don&#39;t have an account?{" "}
          <Link to="/register" className="text-copper hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </div>
  )
}
