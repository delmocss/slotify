import axios from "axios"
import { en, type TranslationKey } from "./i18n/en"
import type { TranslateParams } from "./i18n/context"

type Translate = (key: TranslationKey, params?: TranslateParams) => string

// The API answers in English. Messages that match a UI string (or one of these
// extras) are shown in the user's language; anything else is shown as received.
const EXTRA_SERVER_MESSAGES: Record<string, TranslationKey> = {
  "Invalid credentials": "error.invalidCredentials",
  "Email already in use": "error.emailInUse",
}

// Server messages that embed a value (so they cannot be matched verbatim).
const PATTERNS: { re: RegExp; key: TranslationKey; param: string }[] = [
  { re: /^Price cannot exceed (\d+(?:\.\d+)?)$/, key: "services.v.priceMax", param: "max" },
]

const messageToKey = new Map<string, TranslationKey>(
  (Object.entries(en) as [TranslationKey, string][]).map(([key, value]) => [value, key])
)

/** Best human-readable, translated message for a failed request. */
export function getApiErrorMessage(
  error: unknown,
  t: Translate,
  fallback: TranslationKey = "error.generic"
) {
  if (axios.isAxiosError(error)) {
    if (!error.response) return t("error.network")
    if (error.response.status === 429) return t("error.tooManyRequests")

    const message = (error.response.data as { message?: unknown } | undefined)?.message
    if (typeof message === "string" && message) {
      const key = EXTRA_SERVER_MESSAGES[message] ?? messageToKey.get(message)
      if (key) return t(key)
      for (const { re, key: patternKey, param } of PATTERNS) {
        const match = re.exec(message)
        if (match) return t(patternKey, { [param]: Number(match[1]).toLocaleString() })
      }
      return message
    }
  }
  return t(fallback)
}

export function getApiStatus(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}
