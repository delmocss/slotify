import { motion } from "framer-motion"
import { ReactNode } from "react"

interface CardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
}

export default function Card({
  title,
  value,
  subtitle,
  icon,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#2A2B27] border border-white/5 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-400 mb-2">{title}</p>

          <h3 className="text-2xl font-bold text-white">
            {value}
          </h3>

          {subtitle && (
            <p className="text-xs text-gray-500 mt-2">
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div className="text-copper text-xl">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  )
}
