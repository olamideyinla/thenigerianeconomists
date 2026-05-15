import { type NextRequest } from 'next/server'
import { searchArticles } from '@/lib/search'

// Force Node.js runtime — meilisearch uses Node APIs
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = (searchParams.get('q') ?? '').trim()
  const topic = searchParams.get('topic') ?? undefined
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  if (!q) {
    return Response.json({ hits: [], totalHits: 0, query: '' })
  }

  try {
    const results = await searchArticles(q, { topicSlug: topic, limit, offset })
    return Response.json(results, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    console.error('[search] route error:', err)
    return Response.json(
      { hits: [], totalHits: 0, query: q, error: 'Search temporarily unavailable' },
      { status: 200 }, // 200 so the client degrades gracefully
    )
  }
}
