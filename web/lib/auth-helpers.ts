/**
 * Server-side auth utilities.
 * Call from Server Components, Server Actions, and Route Handlers.
 */

import { redirect } from 'next/navigation'
import { auth } from './auth'

type SessionUser = {
  id: string
  email?: string | null
  name?: string | null
  role: string
}

async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  const u = session.user as SessionUser
  return u
}

/** Redirects to /signin if not authenticated. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect('/signin')
  return user
}

/** Redirects to /admin/login if not an EDITOR or ADMIN. */
export async function requireEditor(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect('/admin/login')
  if (user.role !== 'EDITOR' && user.role !== 'ADMIN') redirect('/admin/login')
  return user
}

/** Redirects to /admin/login if not an ADMIN. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect('/admin/login')
  if (user.role !== 'ADMIN') redirect('/admin/login')
  return user
}

/** Returns null instead of redirecting — use in API routes. */
export async function getEditorOrNull(): Promise<SessionUser | null> {
  const user = await getSessionUser()
  if (!user) return null
  if (user.role !== 'EDITOR' && user.role !== 'ADMIN') return null
  return user
}

export async function getAdminOrNull(): Promise<SessionUser | null> {
  const user = await getSessionUser()
  if (!user) return null
  if (user.role !== 'ADMIN') return null
  return user
}
