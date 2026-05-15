import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

interface Params {
  params: Promise<{ slug: string }>
}

// GET /api/articles/[slug]/notes?offset=0&limit=10 — approved notes (paginated)
export async function GET(req: Request, { params }: Params) {
  const { slug } = await params
  const url = new URL(req.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '10'), 50)
  const offset = parseInt(url.searchParams.get('offset') ?? '0')

  const article = await db.article.findUnique({
    where: { slug, status: 'PUBLISHED' },
    select: { id: true },
  })
  if (!article) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const [notes, total] = await Promise.all([
    db.readerNote.findMany({
      where: { articleId: article.id, status: 'APPROVED' },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    db.readerNote.count({ where: { articleId: article.id, status: 'APPROVED' } }),
  ])

  return NextResponse.json({
    notes: notes.map((n) => ({
      id: n.id,
      body: n.body,
      createdAt: n.createdAt.toISOString(),
      userId: n.userId,
      userName: n.user.name ?? n.user.email?.split('@')[0] ?? 'Reader',
    })),
    total,
  })
}

// POST /api/articles/[slug]/notes — submit a reader note (auth required)
export async function POST(req: Request, { params }: Params) {
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

  const payload = await req.json() as { body?: string }
  const text = (payload.body ?? '').trim()
  if (!text) {
    return NextResponse.json({ error: 'Note body required' }, { status: 400 })
  }
  if (text.length > 600) {
    return NextResponse.json({ error: 'Note exceeds 600 characters' }, { status: 400 })
  }

  const note = await db.readerNote.create({
    data: {
      articleId: article.id,
      userId: session.user.id,
      body: text,
    },
  })

  return NextResponse.json({ id: note.id }, { status: 201 })
}
