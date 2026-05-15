import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { email } = await req.json()
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 })
  }

  // Check email not already taken
  const existing = await db.user.findUnique({ where: { email }, select: { id: true } })
  if (existing && existing.id !== session.user.id) {
    return Response.json({ error: 'Email already in use' }, { status: 409 })
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { email, emailVerified: null }, // reset verification
  })

  return Response.json({ ok: true })
}
