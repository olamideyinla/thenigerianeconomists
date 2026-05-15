import { type NextRequest } from 'next/server'
import { getAdminOrNull } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { writeAuditLog } from '@/lib/audit'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminOrNull()
  if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.session.deleteMany({ where: { userId: id } })
  await writeAuditLog(admin.id, 'user.suspend', 'User', id)

  return Response.json({ ok: true })
}
