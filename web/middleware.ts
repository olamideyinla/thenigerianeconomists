// Edge middleware — cannot use Prisma or Node.js-only modules.
// lib/auth.ts uses strategy:'database' (opaque session tokens, not JWTs),
// so NextAuth's edge auth() cannot validate sessions without a DB call.
// We check only for the session cookie's existence here; the real
// authentication + role enforcement happens in the server-side layouts
// (app/admin/(protected)/layout.tsx, app/account/layout.tsx) which have
// full database access.

import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = [
  '__Secure-next-auth.session-token', // HTTPS (production)
  'next-auth.session-token',          // HTTP (local dev)
]

function hasSession(req: NextRequest): boolean {
  return SESSION_COOKIE.some((name) => !!req.cookies.get(name)?.value)
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const loggedIn = hasSession(req)

  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !loggedIn) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  if (pathname.startsWith('/account') && !loggedIn) {
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
}
