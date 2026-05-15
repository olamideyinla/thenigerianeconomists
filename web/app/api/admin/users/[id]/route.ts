import { type NextRequest } from 'next/server'
import { getAdminOrNull } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { writeAuditLog } from '@/lib/audit'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminOrNull()
  if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { role } = await req.json()

  if (!['READER', 'CONTRIBUTOR', 'EDITOR', 'ADMIN'].includes(role)) {
    return Response.json({ error: 'Invalid role' }, { status: 400 })
  }

  const prev = await db.user.findUnique({ where: { id }, select: { role: true } })
  await db.user.update({ where: { id }, data: { role } })

  await writeAuditLog(admin.id, 'user.role_change', 'User', id, {
    from: prev?.role,
    to: role,
  })

  return Response.json({ ok: true })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // /api/admin/users/[id]/suspend — revoke all sessions
  const admin = await getAdminOrNull()
  if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const url = new URL(req.url)

  if (url.pathname.endsWith('/suspend')) {
    await db.session.deleteMany({ where: { userId: id } })
    await writeAuditLog(admin.id, 'user.suspend', 'User', id)
    return Response.json({ ok: true })
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 })
}
