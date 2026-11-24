import { Navigate } from "react-router-dom"
import { useI18n } from "@/lib/i18n/useI18n"
import { useAuth } from "../features/auth/hooks/useAuth"

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const { t } = useI18n()

  if (isLoading) {
    return <div className="p-8">{t("common.loading")}</div>
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
