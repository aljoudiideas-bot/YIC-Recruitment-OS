"use client"

import { useI18n } from "@/lib/i18n/context"
import { Languages } from "lucide-react"

export function LanguageSwitcher() {
  const { locale } = useI18n()

  function switchLanguage() {
    const newLocale = locale === "en" ? "ar" : "en"
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`
    window.location.reload()
  }

  return (
    <button
      onClick={switchLanguage}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    >
      <Languages className="h-3.5 w-3.5" />
      {locale === "en" ? "AR" : "EN"}
    </button>
  )
}
