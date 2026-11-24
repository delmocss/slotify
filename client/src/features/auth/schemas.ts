import { z } from "zod"
import type { TranslationKey } from "@/lib/i18n/en"
import type { TranslateParams } from "@/lib/i18n/context"

type Translate = (key: TranslationKey, params?: TranslateParams) => string

export function createRegisterSchema(t: Translate) {
  return z.object({
    name: z.string().trim().min(2, t("validation.nameMin")),
    email: z.string().min(1, t("validation.emailRequired")).email(t("validation.emailInvalid")),
    password: z
      .string()
      .min(1, t("validation.passwordRequired"))
      .min(6, t("validation.passwordMin")),
  })
}

export type LoginFormData = { email: string; password: string }
export type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>
