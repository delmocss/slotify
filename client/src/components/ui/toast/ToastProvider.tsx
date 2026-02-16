import { useState } from "react"
import { ToastContext } from "./useToast"
import ToastContainer from "./ToastContainer"

export default function ToastProvider({ children }: any) {
  const [toasts, setToasts] = useState<any[]>([])

  const addToast = (message: string, type = "success") => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  )
}
