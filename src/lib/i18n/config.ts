// src/lib/i18n/config.ts
export const locales = ['en', 'ar', 'fa', 'tr'] as const
export const defaultLocale = 'en'
export type Locale = typeof locales[number]

declare module 'next-intl' {
  interface Messages {
    Admin: {
      Home: {
        title: string
      }
    }
  }
}
