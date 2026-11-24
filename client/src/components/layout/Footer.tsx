import Logo from "../ui/Logo"
import { useI18n } from "@/lib/i18n/useI18n"

export default function Footer() {
  const { t } = useI18n()
  const year = new Date().getFullYear()

  return (
    <footer className="relative w-full border-t border-white/[0.04] bg-[#12130f]/50 backdrop-blur-2xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 tracking-[0.18em] uppercase">
            <Logo className="h-4 w-4 text-copper/80" />
            <span>Slotify</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-gray-600 tracking-[0.12em] normal-case">
              {t("footer.tagline")}
            </span>
          </div>
          <p className="text-[11px] text-gray-600 tracking-wide">
            {t("footer.copyright", { year })}
          </p>
        </div>
      </div>
    </footer>
  )
}
