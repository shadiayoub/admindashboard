// src/middleware.ts
import { NextResponse } from 'next/server'
import Negotiator from 'negotiator'
import { match } from '@formatjs/intl-localematcher'

const locales = ['en', 'ar', 'fa', 'tr'] as const
const defaultLocale = 'en'

function detectLocale(request: Request) {
  return match(
    new Negotiator({
      headers: { 'accept-language': request.headers.get('accept-language') || '' }
    }).languages(),
    [...locales],
    defaultLocale
  )
}

export function middleware(request: Request) {
  const { pathname } = request.nextUrl
  const pathLocale = pathname.split('/')[1]

  // Skip static files and API routes
  if (pathname.startsWith('/_next') || pathname.match(/\.(ico|png|jpg)$/)) {
    return NextResponse.next()
  }

  // Get or detect locale
  const locale = request.cookies.get('NEXT_LOCALE')?.value || detectLocale(request)

  // Handle root redirect
  if (pathname === '/') {
    const response = NextResponse.redirect(new URL(`/${locale}`, request.url))
    if (!request.cookies.has('NEXT_LOCALE')) {
      response.cookies.set('NEXT_LOCALE', locale)
    }
    return response
  }

  // If path already has valid locale, continue
  if (locales.includes(pathLocale)) {
    const response = NextResponse.next()
    if (!request.cookies.has('NEXT_LOCALE')) {
      response.cookies.set('NEXT_LOCALE', pathLocale)
    }
    return response
  }

  // Auto-prefix all other paths with locale
  const response = NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url))
  if (!request.cookies.has('NEXT_LOCALE')) {
    response.cookies.set('NEXT_LOCALE', locale)
  }
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image).*)']
}
