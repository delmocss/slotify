import { motion, AnimatePresence } from "framer-motion"

interface ToastItem {
  id: number
  message: string
  type: "success" | "error"
}

export default function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="pointer-events-none fixed left-4 right-4 top-[max(1rem,env(safe-area-inset-top))] z-50 space-y-2 sm:left-auto sm:max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto break-words rounded px-4 py-3 text-sm text-white shadow-lg sm:text-base ${
              toast.type === "success" ? "bg-green-600" : "bg-red-500"
            }`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
