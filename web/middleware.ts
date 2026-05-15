import { auth } from './lib/auth'

export default auth((req) => {
  const { pathname } = req.nextUrl

  // ── Admin routes ────────────────────────────────────────────────
  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminLogin = pathname === '/admin/login'

  if (isAdminRoute && !isAdminLogin && !req.auth) {
    return Response.redirect(new URL('/admin/login', req.url))
  }

  // Editors/admins only — checked server-side in layout too, but fast-path here
  if (isAdminRoute && !isAdminLogin && req.auth) {
    const role = (req.auth.user as { role?: string } | undefined)?.role
    if (role !== 'EDITOR' && role !== 'ADMIN') {
      return Response.redirect(new URL('/admin/login', req.url))
    }
  }

  // ── Account routes ──────────────────────────────────────────────
  const isAccountRoute = pathname.startsWith('/account')
  if (isAccountRoute && !req.auth) {
    return Response.redirect(new URL('/signin', req.url))
  }
})

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
}
