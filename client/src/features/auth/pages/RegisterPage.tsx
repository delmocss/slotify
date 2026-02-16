import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, RegisterFormData } from "../schemas"
import { register as registerApi } from "../api/auth.api"
import { useNavigate } from "react-router-dom"
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
    <div className="max-w-md mx-auto mt-20 bg-white p-6 shadow rounded">
      <h2 className="text-xl font-bold mb-4">Register</h2>

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="space-y-4"
      >
        <input {...register("name")} placeholder="Business Name" className="w-full border p-2 rounded" />
        <input {...register("email")} placeholder="Email" className="w-full border p-2 rounded" />
        <input {...register("password")} type="password" placeholder="Password" className="w-full border p-2 rounded" />

        <button type="submit" className="w-full bg-black text-white p-2 rounded">
          Create Account
        </button>
      </form>
    </div>
  )
}
