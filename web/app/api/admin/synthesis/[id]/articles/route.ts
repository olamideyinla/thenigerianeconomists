import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

async function requireEditor() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || (role !== 'EDITOR' && role !== 'ADMIN')) return null
  return session.user
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireEditor()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: synthesisId } = await params
  const { slug } = await req.json()

  const article = await db.article.findUnique({ where: { slug }, select: { id: true } })
  if (!article) return Response.json({ error: `No article with slug "${slug}"` }, { status: 404 })

  const maxResult = await db.synthesisArticle.aggregate({
    where: { synthesisId },
    _max: { order: true },
  })
  const nextOrder = (maxResult._max.order ?? 0) + 1

  await db.synthesisArticle.create({
    data: { synthesisId, articleId: article.id, order: nextOrder },
  })

  return Response.json({ ok: true })
}
