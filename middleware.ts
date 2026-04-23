import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/shift-logs', '/verifications', '/grievance', '/profile', '/resources']
const AUTH_ROUTES = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if it's a protected route
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))

  // We use localStorage for auth (client-side), so middleware just checks a cookie
  // The actual redirect logic lives inside each page via useAuth hook
  // This middleware is a lightweight guard using a cookie set at login
  const userCookie = request.cookies.get('fairgig_logged_in')

  if (isProtected && !userCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && userCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
