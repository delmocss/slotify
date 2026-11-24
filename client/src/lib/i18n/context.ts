import { createContext } from "react"
import type { TranslationKey } from "./en"

export type Lang = "en" | "es"

export const LANGS: { code: Lang; label: string; name: string }[] = [
  { code: "es", label: "ES", name: "Español" },
  { code: "en", label: "EN", name: "English" },
]

export type TranslateParams = Record<string, string | number>

export interface I18nContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  /** BCP 47 locale for Intl formatting (dates, numbers). */
  locale: string
  t: (key: TranslationKey, params?: TranslateParams) => string
}

export const I18nContext = createContext<I18nContextType | null>(null)
