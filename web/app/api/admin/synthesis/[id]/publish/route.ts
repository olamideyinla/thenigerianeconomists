import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

async function requireEditor() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || (role !== 'EDITOR' && role !== 'ADMIN')) return null
  return session.user
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireEditor()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await db.synthesis.update({
    where: { id },
    data: { publishedAt: new Date() },
  })
  return Response.json({ ok: true })
}
