import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

interface Params {
  params: Promise<{ slug: string }>
}

// POST /api/articles/[slug]/endorse — toggle endorsement for authenticated user
export async function POST(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { slug } = await params
  const article = await db.article.findUnique({
    where: { slug, status: 'PUBLISHED' },
    select: { id: true },
  })
  if (!article) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const userId = session.user.id
  const articleId = article.id

  const existing = await db.endorsement.findUnique({
    where: { articleId_userId: { articleId, userId } },
  })

  if (existing) {
    await db.endorsement.delete({ where: { id: existing.id } })
  } else {
    await db.endorsement.create({ data: { articleId, userId } })
  }

  const count = await db.endorsement.count({ where: { articleId } })
  return NextResponse.json({ count, liked: !existing })
}
