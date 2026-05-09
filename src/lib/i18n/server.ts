import { cookies } from 'next/headers'
import type { Locale } from './context'
import { en } from './en'
import { ar } from './ar'
import type { Dict } from './en'

const dicts: Record<Locale, Dict> = { en, ar }

export async function getServerT() {
  const cookieStore = await cookies()
  const locale = (cookieStore.get('locale')?.value || 'en') as Locale
  const dict = dicts[locale]

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
