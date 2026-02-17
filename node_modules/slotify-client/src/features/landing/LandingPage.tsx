import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#2f302c] via-[#3B3C36] to-black flex flex-col items-center justify-center px-6 py-16 text-white">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-5xl font-bold mb-6"
      >
        Slotify
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-300 mb-12 text-center max-w-2xl text-lg"
      >
        Smart booking platform for professionals and small businesses.
        Manage your schedule effortlessly.
      </motion.p>

      <div className="flex gap-6">
        <Link
          to="/register"
          className="bg-copper text-white hover:brightness-95 transition-all duration-200 px-8 py-3 rounded-xl font-semibold"
        >
          Get Started
        </Link>

        <Link
          to="/login"
          className="border border-white/10 text-gray-200 hover:bg-white/5 transition-all duration-200 px-8 py-3 rounded-xl font-semibold"
        >
          Login
        </Link>
      </div>
    </div>
  )
}
