import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!role || !['EDITOR', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { status } = await req.json() as { status?: string }

  const valid = ['PENDING', 'ACCEPTED', 'REJECTED']
  if (!status || !valid.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  await db.submission.update({ where: { id }, data: { status: status as 'PENDING' | 'ACCEPTED' | 'REJECTED' } })
  return NextResponse.json({ ok: true })
}
