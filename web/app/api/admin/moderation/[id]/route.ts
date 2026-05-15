import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || (role !== 'EDITOR' && role !== 'ADMIN')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { action } = await req.json()
  const status = action === 'approve' ? 'APPROVED' : 'REJECTED'

  await db.readerNote.update({
    where: { id },
    data: {
      status,
      moderatedBy: session.user.id,
      moderatedAt: new Date(),
    },
  })

  return Response.json({ ok: true })
}
