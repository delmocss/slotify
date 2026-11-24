import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "../lib/queryClient"
import { ReactNode } from "react"
import ToastProvider from "../components/ui/toast/ToastProvider"
import I18nProvider from "../lib/i18n/I18nProvider"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ToastProvider>{children}</ToastProvider>
      </I18nProvider>
    </QueryClientProvider>
  )
}
