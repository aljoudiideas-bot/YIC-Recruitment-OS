"use client"

import { createContext, useContext, type ReactNode } from 'react'
import type { Dict } from './en'
import { en } from './en'
import { ar } from './ar'

export type Locale = 'en' | 'ar'

const dictionaries: Record<Locale, Dict> = { en, ar }

interface I18nContextType {
  locale: Locale
  dict: Dict
  dir: 'ltr' | 'rtl'
}

const I18nContext = createContext<I18nContextType>({ locale: 'en', dict: en, dir: 'ltr' })

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const dict = dictionaries[locale]
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  return <I18nContext.Provider value={{ locale, dict, dir }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}

export function useT() {
  const { dict } = useI18n()
  return function t(path: string): string {
    const keys = path.split('.')
    let result: unknown = dict
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = (result as Record<string, unknown>)[key]
      } else {
        return path
      }
    }
    return typeof result === 'string' ? result : path
  }
}
