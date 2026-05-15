import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// One-time admin bootstrap route.
// Promotes AUTH_ADMIN_EMAIL to ADMIN role.
// Protected by BOOTSTRAP_TOKEN — delete this file after use.

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const expected = process.env.BOOTSTRAP_TOKEN

  if (!expected || !token || token !== expected) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const email = process.env.AUTH_ADMIN_EMAIL
  if (!email) {
    return NextResponse.json({ error: 'AUTH_ADMIN_EMAIL is not set' }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { email }, select: { id: true, role: true } })
  if (!user) {
    return NextResponse.json({ error: `No account found for ${email}. Sign in once first, then visit this URL.` }, { status: 404 })
  }

  await db.user.update({ where: { email }, data: { role: 'ADMIN' } })

  return NextResponse.json({ ok: true, promoted: email, role: 'ADMIN' })
}
