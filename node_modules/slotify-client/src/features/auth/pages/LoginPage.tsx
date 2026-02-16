import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, LoginFormData } from "../schemas"
import { login } from "../api/auth.api"
import { useNavigate } from "react-router-dom"
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
    <div className="max-w-md mx-auto mt-20 bg-white p-6 shadow rounded">
      <h2 className="text-xl font-bold mb-4">Login</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register("email")}
          placeholder="Email"
          className="w-full border p-2 rounded"
        />
        {errors.email && <p className="text-red-500">Invalid email</p>}

        <input
          {...register("password")}
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
        />
        {errors.password && (
          <p className="text-red-500">Invalid password</p>
        )}

        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  )
}
