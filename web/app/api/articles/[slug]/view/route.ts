import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit, clientIp } from '@/lib/rate-limit'

// One increment per IP per article per hour
const LIMIT = 1
const WINDOW_MS = 60 * 60 * 1000

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  const rl = rateLimit(req, { limit: LIMIT, windowMs: WINDOW_MS, namespace: `view:${slug}` })
  if (!rl.ok) {
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  await db.article.updateMany({
    where: { slug, status: 'PUBLISHED' },
    data: { viewCount: { increment: 1 } },
  })

  return NextResponse.json({ ok: true })
}
