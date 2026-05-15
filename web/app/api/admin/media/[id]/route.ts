import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

async function requireEditor() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || (role !== 'EDITOR' && role !== 'ADMIN')) return null
  return session.user
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireEditor()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const asset = await db.mediaAsset.findUnique({
    where: { id },
    include: { _count: { select: { figures: true } } },
  })
  if (!asset) return Response.json({ error: 'Not found' }, { status: 404 })
  if (asset._count.figures > 0) {
    return Response.json({ error: 'Asset is in use' }, { status: 409 })
  }
  await db.mediaAsset.delete({ where: { id } })
  return Response.json({ ok: true })
}
