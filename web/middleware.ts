// Middleware runs on the Edge runtime — must not import Prisma or any
// Node.js-only module. Auth is validated here using only the session
// cookie + AUTH_SECRET (no database round-trip). Role checks are done
// server-side inside app/admin/layout.tsx and app/account/layout.tsx.
import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth?.user

  // Admin routes — redirect unauthenticated users to login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !isLoggedIn) {
    return Response.redirect(new URL('/admin/login', req.url))
  }

  // Account routes — redirect unauthenticated users to sign-in
  if (pathname.startsWith('/account') && !isLoggedIn) {
    return Response.redirect(new URL('/signin', req.url))
  }
})

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
}
