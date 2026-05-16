import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          backgroundColor: '#f5f0e8',
          fontFamily: 'serif',
        }}
      >
        {/* Top rule */}
        <div style={{ width: '48px', height: '3px', backgroundColor: '#c0541a' }} />

        {/* Wordmark */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              fontSize: '13px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#c0541a',
              fontFamily: 'sans-serif',
              fontWeight: 700,
            }}
          >
            The
          </div>
          <div
            style={{
              fontSize: '80px',
              fontWeight: 500,
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              color: '#1a1714',
              fontStyle: 'italic',
            }}
          >
            Nigerian
          </div>
          <div
            style={{
              fontSize: '80px',
              fontWeight: 500,
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              color: '#1a1714',
              fontStyle: 'italic',
            }}
          >
            Economists
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '22px',
            lineHeight: 1.4,
            color: '#5a5248',
            fontStyle: 'italic',
            borderTop: '1px solid #c8bfaf',
            paddingTop: '24px',
          }}
        >
          Rigorous economic analysis and commentary on Nigeria and Africa.
        </div>
      </div>
    ),
    { ...size },
  )
}
