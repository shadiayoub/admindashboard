// src/middleware.ts
import { NextResponse } from 'next/server'
import Negotiator from 'negotiator'
import { match } from '@formatjs/intl-localematcher'
import type { NextRequest } from 'next/server'

const locales = ['en', 'ar', 'fa', 'tr'] as const
const defaultLocale = 'en'

// Static file extensions to exclude from localization
const staticExtensions = ['ico', 'png', 'jpg', 'jpeg', 'svg', 'css', 'js', 'woff', 'woff2']
const staticPattern = new RegExp(`\\.(${staticExtensions.join('|')})$`)

function detectLocale(request: NextRequest) {
  return match(
    new Negotiator({
      headers: { 'accept-language': request.headers.get('accept-language') || '' }
    }).languages(),
    [...locales],
    defaultLocale
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static files and public assets
  if (
    pathname.startsWith('/_next') || // Next.js internal files
    pathname.startsWith('/images/') || // Public images
    pathname.startsWith('/favicon.ico') || // Favicon
    staticPattern.test(pathname) // Any static file extension
  ) {
    return NextResponse.next()
  }

  // Skip API routes completely
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const pathLocale = pathname.split('/')[1]

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
  if (locales.includes(pathLocale as any)) {
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
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images/|static/).*)'
  ]
}
