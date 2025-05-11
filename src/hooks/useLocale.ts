// hooks/useLocale.ts
'use client'
import { usePathname } from 'next/navigation'
import { locales } from '@/lib/i18n/config'

export function useLocale() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  return locales.includes(locale) ? locale : 'en'
}
