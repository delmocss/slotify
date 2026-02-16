import { Navigate } from "react-router-dom"
import { useAuth } from "../features/auth/hooks/useAuth"

export default function ProtectedRoute({ children }: any) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <div>Loading...</div>

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return children
}
