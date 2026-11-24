import { Languages } from "lucide-react"
import { LANGS } from "@/lib/i18n/context"
import { useI18n } from "@/lib/i18n/useI18n"

type Props = {
  className?: string
}

/** Compact ES | EN toggle. */
export default function LanguageSwitcher({ className = "" }: Props) {
  const { lang, setLang, t } = useI18n()

  return (
    <div
      role="group"
      aria-label={t("common.language")}
      className={`inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-0.5 ${className}`}
    >
      <Languages className="ml-2 mr-0.5 h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
      {LANGS.map(({ code, label, name }) => {
        const active = lang === code
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            title={name}
            lang={code}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wider transition sm:px-2.5 sm:py-1 ${
              active
                ? "bg-copper text-[#1a1b17]"
                : "text-gray-400 hover:bg-white/[0.06] hover:text-gray-100"
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
