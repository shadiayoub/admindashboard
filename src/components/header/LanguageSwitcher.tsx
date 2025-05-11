// components/LanguageSwitcher.tsx
'use client'
import { usePathname, useRouter } from 'next/navigation'
import { locales } from '@/lib/i18n/config'

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = (locale: string) => {
    // Preserve other path segments
    const newPath = pathname.replace(/^\/(en|ar|fa|tr)/, `/${locale}`)
    router.push(newPath)
  }

  return (
    <div className="flex gap-2">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLanguage(locale)}
          className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
