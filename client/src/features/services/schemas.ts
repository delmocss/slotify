import { z } from "zod"
import type { TranslationKey } from "@/lib/i18n/en"
import type { TranslateParams } from "@/lib/i18n/context"

type Translate = (key: TranslationKey, params?: TranslateParams) => string

// Keep these limits in sync with server/src/modules/services/services.schema.ts.
export const MAX_DURATION_MINUTES = 1440
export const MAX_PRICE = 100000

export function createServiceSchema(t: Translate, locale = "en-GB") {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, t("services.v.nameMin"))
      .max(80, t("services.v.nameMax"))
      .refine((value) => /[a-z0-9]/i.test(value), t("services.v.nameChars")),
    duration_minutes: z
      .number({ error: t("services.v.durationRequired") })
      .int(t("services.v.durationInt"))
      .min(1, t("services.v.durationMin"))
      .max(MAX_DURATION_MINUTES, t("services.v.durationMax")),
    price: z
      .number({ error: t("services.v.priceRequired") })
      .min(0, t("services.v.priceMin"))
      .max(MAX_PRICE, t("services.v.priceMax", { max: MAX_PRICE.toLocaleString(locale) }))
      .refine(
        (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6,
        t("services.v.priceDecimals")
      ),
  })
}

export type ServiceFormData = {
  name: string
  duration_minutes: number
  price: number
}
