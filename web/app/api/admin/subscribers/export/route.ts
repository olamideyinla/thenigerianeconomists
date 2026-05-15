import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || (role !== 'EDITOR' && role !== 'ADMIN')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subs = await db.newsletterSubscription.findMany({
    where: { confirmedAt: { not: null }, unsubscribedAt: null },
    orderBy: { createdAt: 'desc' },
  })

  const lines = [
    'email,source,confirmed_at,created_at',
    ...subs.map((s) =>
      [s.email, s.source, s.confirmedAt?.toISOString() ?? '', s.createdAt.toISOString()].join(','),
    ),
  ]

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
