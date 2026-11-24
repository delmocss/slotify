import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useI18n } from "@/lib/i18n/useI18n"

export default function LandingPage() {
  const { t } = useI18n()

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden px-6 py-16 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-[#2f302c] via-[#3B3C36] to-black">
        <div className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-copper/12 blur-3xl sm:-top-24 sm:h-80 sm:w-80 lg:h-[28rem] lg:w-[28rem]" />
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-white/6 blur-3xl sm:h-72 sm:w-72 lg:h-[24rem] lg:w-[24rem]" />
        <div className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-white/5 blur-3xl sm:h-52 sm:w-52 lg:h-64 lg:w-64" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-[70vh] w-full max-w-5xl flex-col items-center justify-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 text-[11px] font-semibold uppercase tracking-[0.35em] text-gray-500"
        >
          {t("landing.eyebrow")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
        >
          {t("landing.titleLine1")}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-copper">
            {t("landing.titleLine2")}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 max-w-2xl text-base text-gray-300 sm:text-lg"
        >
          {t("landing.subtitle")}
        </motion.p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            to="/register"
            className="rounded-full bg-copper px-8 py-3 text-sm font-semibold text-white transition hover:brightness-95"
          >
            {t("landing.getStarted")}
          </Link>

          <Link
            to="/login"
            className="rounded-full border border-white/10 px-8 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/5"
          >
            {t("landing.login")}
          </Link>
        </div>
      </div>

      <div className="relative mx-auto mt-16 grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: t("landing.f1.title"), text: t("landing.f1.text") },
          { title: t("landing.f2.title"), text: t("landing.f2.text") },
          { title: t("landing.f3.title"), text: t("landing.f3.text") },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
          >
            <p className="text-sm font-semibold text-white/90">{item.title}</p>
            <p className="mt-2 text-sm text-gray-400">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
