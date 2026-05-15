import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

async function requireEditor() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || (role !== 'EDITOR' && role !== 'ADMIN')) return null
  return session.user
}

export async function POST(req: NextRequest) {
  if (!await requireEditor()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const funder = await db.funder.create({
    data: {
      name: body.name,
      type: body.type,
      amountRange: body.amountRange || '',
      periodStart: new Date(body.periodStart),
      periodEnd: body.periodEnd ? new Date(body.periodEnd) : null,
      description: body.description || '',
      url: body.url || null,
      displayOrder: body.displayOrder ?? 0,
      isCurrent: body.isCurrent ?? true,
    },
  })
  return Response.json({ funder })
}
