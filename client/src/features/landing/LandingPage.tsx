import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-6">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-4xl font-bold mb-4"
      >
        Slotify
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-600 mb-8 text-center max-w-md"
      >
        Smart booking platform for professionals and small businesses.
        Manage your schedule effortlessly.
      </motion.p>

      <div className="flex gap-4">
        <Link
          to="/register"
          className="bg-black text-white px-6 py-2 rounded"
        >
          Get Started
        </Link>

        <Link
          to="/login"
          className="border px-6 py-2 rounded"
        >
          Login
        </Link>
      </div>
    </div>
  )
}
