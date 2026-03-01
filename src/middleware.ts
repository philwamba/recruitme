import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = new Set([
  '/',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/unauthorized',
])

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) {
    return true
  }

  return pathname.startsWith('/_next') || pathname === '/favicon.ico'
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const cookieName = process.env.SESSION_COOKIE_NAME ?? 'recruitme_session'
  const hasSession = Boolean(request.cookies.get(cookieName)?.value)
  const isProtectedArea =
    pathname.startsWith('/applicant') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/employer')

  if (isProtectedArea && !hasSession) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(signInUrl)
  }

  if (hasSession && (pathname === '/sign-in' || pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/applicant/dashboard', request.url))
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)'],
}
