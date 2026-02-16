import { useQuery } from "@tanstack/react-query"
import { getMe } from "../api/auth.api"

export function useAuth() {
  const token = localStorage.getItem("token")

  const query = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: !!token,
  })

  return {
    user: query.data,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
  }
}
