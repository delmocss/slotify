import { motion, AnimatePresence } from "framer-motion"

interface ToastItem {
  id: number
  message: string
  type: "success" | "error"
}

export default function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`px-4 py-3 rounded shadow text-white ${
              toast.type === "success"
                ? "bg-green-600"
                : "bg-red-500"
            }`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
