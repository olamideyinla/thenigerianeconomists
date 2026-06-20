import { ImageResponse } from 'next/og'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ArticleOgImage({ params }: Props) {
  const { slug } = await params

  const article = await db.article.findUnique({
    where: { slug },
    select: {
      headline: true,
      deck: true,
      kicker: true,
      author: { select: { name: true } },
      topic: { select: { name: true } },
      figures: {
        where: { kind: 'IMAGE' },
        orderBy: { position: 'asc' },
        take: 1,
        select: {
          mediaAsset: { select: { publicUrl: true } },
        },
      },
    },
  })

  const headline = article?.headline ?? 'The Nigerian Economists'
  const deck = article?.deck ?? 'Rigorous economic analysis on Nigeria and Africa.'
  const kicker = article?.kicker ?? article?.topic?.name ?? 'Analysis'
  const authorName = article?.author?.name ?? ''
  const photoUrl = article?.figures?.[0]?.mediaAsset?.publicUrl ?? null

  // ── Split layout (photo + text) ───────────────────────────────────
  if (photoUrl) {
    const headlineText = headline.length > 90 ? headline.substring(0, 90) + '…' : headline
    const deckText = deck.length > 95 ? deck.substring(0, 95) + '…' : deck

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            backgroundColor: '#f5f0e8',
          }}
        >
          {/* Text panel */}
          <div
            style={{
              width: '620px',
              height: '630px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '52px 56px',
              backgroundColor: '#f5f0e8',
            }}
          >
            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  fontSize: '12px',
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
                  fontSize: '12px',
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
                gap: '16px',
                flex: 1,
                justifyContent: 'center',
                paddingTop: '24px',
                paddingBottom: '24px',
              }}
            >
              <div
                style={{
                  fontSize: headline.length > 60 ? '36px' : '44px',
                  fontWeight: 500,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  color: '#1a1714',
                  fontStyle: 'italic',
                  fontFamily: 'serif',
                }}
              >
                {headlineText}
              </div>
              {deck && (
                <div
                  style={{
                    fontSize: '18px',
                    lineHeight: 1.45,
                    color: '#5a5248',
                    fontStyle: 'italic',
                    fontFamily: 'serif',
                  }}
                >
                  {deckText}
                </div>
              )}
            </div>

            {/* Author */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid #c8bfaf',
                paddingTop: '16px',
              }}
            >
              {authorName && (
                <div style={{ fontSize: '14px', color: '#5a5248', fontFamily: 'sans-serif' }}>
                  {authorName}
                </div>
              )}
              <div style={{ width: '32px', height: '2px', backgroundColor: '#c0541a' }} />
            </div>
          </div>

          {/* Photo panel */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt=""
            style={{
              width: '580px',
              height: '630px',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        </div>
      ),
      { ...size },
    )
  }

  // ── Text-only fallback ─────────────────────────────────────────────
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

        {/* Headline */}
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
