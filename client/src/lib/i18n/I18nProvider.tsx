import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { en, type TranslationKey } from "./en"
import { es } from "./es"
import { I18nContext, type Lang, type TranslateParams } from "./context"

const STORAGE_KEY = "slotify-lang"
const dictionaries: Record<Lang, Record<TranslationKey, string>> = { en, es }
const locales: Record<Lang, string> = { en: "en-GB", es: "es-ES" }

function detectInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === "en" || saved === "es") return saved
  } catch {
    // storage unavailable (private mode): fall through to the browser language
  }
  return navigator.language?.toLowerCase().startsWith("es") ? "es" : "en"
}

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore: the choice just will not persist
    }
  }, [])

  const t = useCallback(
    (key: TranslationKey, params?: TranslateParams) => {
      const text = dictionaries[lang][key] ?? en[key] ?? key
      if (!params) return text
      return text.replace(/\{(\w+)\}/g, (match, name) =>
        name in params ? String(params[name]) : match
      )
    },
    [lang]
  )

  const value = useMemo(() => ({ lang, setLang, locale: locales[lang], t }), [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
