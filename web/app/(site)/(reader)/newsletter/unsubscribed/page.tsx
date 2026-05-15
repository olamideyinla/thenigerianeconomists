import Link from 'next/link'

export const metadata = { title: 'Unsubscribed — The Nigerian Economist' }

export default function UnsubscribedPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const invalid = searchParams.status === 'invalid'

  return (
    <div style={{ maxWidth: 580, margin: '80px auto', padding: '0 24px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      {invalid ? (
        <>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: '0 0 16px' }}>
            Invalid unsubscribe link
          </h1>
          <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: 32 }}>
            This link is invalid or has already been used. If you would like to unsubscribe,
            please use the link in the most recent newsletter email.
          </p>
        </>
      ) : (
        <>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: 12 }}>
            Unsubscribed
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: '0 0 16px' }}>
            You&apos;ve been unsubscribed
          </h1>
          <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: 32 }}>
            You will no longer receive newsletter emails from The Nigerian Economist.
            You can resubscribe at any time.
          </p>
          <Link
            href="/newsletter"
            style={{ display: 'inline-block', backgroundColor: '#1a2a3a', color: '#fff', fontWeight: 600, fontSize: 14, padding: '12px 28px', borderRadius: 2, textDecoration: 'none' }}
          >
            Resubscribe
          </Link>
        </>
      )}

      <div style={{ marginTop: 48 }}>
        <Link href="/" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>
          ← Return to The Nigerian Economist
        </Link>
      </div>
    </div>
  )
}
