import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Temporary diagnostic route — DELETE BEFORE LAUNCH
export async function GET() {
  const errors: Record<string, unknown> = {}
  const results: Record<string, unknown> = {}

  // Test 1: simple count
  try {
    results.articleCount = await db.article.count()
  } catch (e) {
    errors.articleCount = {
      message: (e as Error).message,
      name: (e as Error).name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      code: (e as any).code,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      meta: (e as any).meta,
    }
  }

  // Test 2: article findMany with status filter
  try {
    const articles = await db.article.findMany({
      where: { status: 'PUBLISHED' },
      take: 1,
      select: { id: true, slug: true, status: true },
    })
    results.articleQuery = articles
  } catch (e) {
    errors.articleQuery = {
      message: (e as Error).message,
      name: (e as Error).name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      code: (e as any).code,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      meta: (e as any).meta,
    }
  }

  // Test 3: synthesis findFirst
  try {
    const s = await db.synthesis.findFirst({
      where: { publishedAt: { not: null } },
      select: { id: true, slug: true },
    })
    results.synthesis = s
  } catch (e) {
    errors.synthesis = {
      message: (e as Error).message,
      name: (e as Error).name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      code: (e as any).code,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      meta: (e as any).meta,
    }
  }

  // Test 4: full homepage query
  try {
    const articles = await db.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      include: {
        author: true,
        topic: true,
        rebuttedBy: {
          include: {
            rebuttalArticle: { include: { author: true } },
          },
        },
        _count: { select: { endorsements: true } },
      },
    })
    results.fullQuery = articles.map((a) => ({ id: a.id, slug: a.slug }))
  } catch (e) {
    errors.fullQuery = {
      message: (e as Error).message,
      name: (e as Error).name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      code: (e as any).code,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      meta: (e as any).meta,
      stack: (e as Error).stack?.split('\n').slice(0, 10),
    }
  }

  return NextResponse.json({ results, errors })
}
