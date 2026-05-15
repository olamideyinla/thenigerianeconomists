import { db } from '@/lib/db'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const SITE_TITLE = 'The Nigerian Economists'
const SITE_DESC =
  'Rigorous economic analysis and commentary on Nigeria and Africa.'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const articles = await db.article.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      author: { select: { name: true } },
      topic: { select: { name: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: 50,
  })

  const items = articles
    .map((a) => {
      const url = `${BASE}/articles/${a.slug}`
      const pubDate = a.publishedAt ? new Date(a.publishedAt).toUTCString() : ''
      const title = escapeXml(a.headline)
      const desc = escapeXml(a.deck)
      const author = escapeXml(a.author.name)
      const category = escapeXml(a.topic.name)

      return `    <item>
      <title>${title}</title>
      <link>${url}</link>
      <description>${desc}</description>
      <author>${author}</author>
      <category>${category}</category>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}
      <guid isPermaLink="true">${url}</guid>
    </item>`
    })
    .join('\n')

  const lastBuildDate =
    articles[0]?.publishedAt
      ? new Date(articles[0].publishedAt).toUTCString()
      : new Date().toUTCString()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${BASE}</link>
    <description>${escapeXml(SITE_DESC)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
