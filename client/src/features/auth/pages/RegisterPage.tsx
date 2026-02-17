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
    <div className="w-full max-w-lg bg-[#2A2B27] p-12 rounded-3xl shadow-2xl border border-white/5">
      <h2 className="text-2xl font-bold mb-8 text-white">Register</h2>

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="space-y-6"
      >
        <input {...register("name")} placeholder="Business Name" className="w-full bg-ashSoft border border-white/10 text-white placeholder-gray-400 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-copper transition" />
        <input {...register("email")} placeholder="Email" className="w-full bg-ashSoft border border-white/10 text-white placeholder-gray-400 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-copper transition" />
        <input {...register("password")} type="password" placeholder="Password" className="w-full bg-ashSoft border border-white/10 text-white placeholder-gray-400 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-copper transition" />

        <button type="submit" className="w-full bg-copper text-white py-4 rounded-xl font-semibold tracking-wide hover:brightness-95 transition-all duration-200">
          Create Account
        </button>

        <p className="text-sm text-gray-400 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-copper hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}
