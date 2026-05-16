import { type NextRequest } from 'next/server'
import { searchArticles } from '@/lib/search'
import { rateLimit } from '@/lib/rate-limit'

// Force Node.js runtime — meilisearch uses Node APIs
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  // 30 searches per IP per minute
  const rl = rateLimit(req, { limit: 30, windowMs: 60 * 1000, namespace: 'search' })
  if (!rl.ok) {
    return Response.json(
      { hits: [], totalHits: 0, query: '', error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    )
  }

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
