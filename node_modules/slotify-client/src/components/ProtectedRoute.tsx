import { Navigate } from "react-router-dom"
import { useAuth } from "../features/auth/hooks/useAuth"

export default function ProtectedRoute({ children }: any) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
