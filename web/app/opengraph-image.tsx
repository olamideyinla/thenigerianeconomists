import { ImageResponse } from 'next/og'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage() {
  const article = await db.article.findFirst({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    select: {
      headline: true,
      deck: true,
      kicker: true,
      author: { select: { name: true } },
      topic: { select: { name: true } },
    },
  })

  const headline = article?.headline ?? 'The Nigerian Economists'
  const deck = article?.deck ?? 'Rigorous economic analysis and commentary on Nigeria and Africa.'
  const kicker = article?.kicker ?? article?.topic?.name ?? 'Analysis'
  const authorName = article?.author?.name ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 72px',
          backgroundColor: '#f5f0e8',
          fontFamily: 'serif',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontSize: '13px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#c0541a',
              fontFamily: 'sans-serif',
              fontWeight: 700,
            }}
          >
            {kicker}
          </div>
          <div
            style={{
              fontSize: '13px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#888',
              fontFamily: 'sans-serif',
            }}
          >
            The Nigerian Economists
          </div>
        </div>

        {/* Headline + deck */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            flex: 1,
            justifyContent: 'center',
            paddingTop: '32px',
            paddingBottom: '32px',
          }}
        >
          <div
            style={{
              fontSize: headline.length > 60 ? '44px' : '56px',
              fontWeight: 500,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: '#1a1714',
              fontStyle: 'italic',
            }}
          >
            {headline}
          </div>
          {deck && (
            <div
              style={{
                fontSize: '22px',
                lineHeight: 1.45,
                color: '#5a5248',
                fontStyle: 'italic',
                maxWidth: '900px',
              }}
            >
              {deck.length > 120 ? deck.substring(0, 120) + '…' : deck}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #c8bfaf',
            paddingTop: '20px',
          }}
        >
          {authorName && (
            <div
              style={{
                fontSize: '16px',
                color: '#5a5248',
                fontFamily: 'sans-serif',
              }}
            >
              {authorName}
            </div>
          )}
          <div
            style={{
              width: '40px',
              height: '2px',
              backgroundColor: '#c0541a',
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  )
}
