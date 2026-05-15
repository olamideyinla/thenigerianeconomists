import Link from 'next/link'

export const metadata = { title: 'Subscription confirmed — The Nigerian Economist' }

export default function ConfirmedPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const invalid = searchParams.status === 'invalid'

  return (
    <div style={{ maxWidth: 580, margin: '80px auto', padding: '0 24px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      {invalid ? (
        <>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c27b2c', marginBottom: 12 }}>
            Invalid or expired link
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: '0 0 16px' }}>
            This confirmation link has expired
          </h1>
          <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: 32 }}>
            Confirmation links expire after 7 days. Please subscribe again and we will send a fresh link.
          </p>
          <Link
            href="/newsletter"
            style={{ display: 'inline-block', backgroundColor: '#1a2a3a', color: '#fff', fontWeight: 600, fontSize: 14, padding: '12px 28px', borderRadius: 2, textDecoration: 'none' }}
          >
            Subscribe again
          </Link>
        </>
      ) : (
        <>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c27b2c', marginBottom: 12 }}>
            You&apos;re confirmed
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: '0 0 16px' }}>
            Welcome to The Nigerian Economist
          </h1>
          <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: 32 }}>
            Your subscription is active. We&apos;ll send you our next weekly synthesis as soon as it is published.
            In the meantime, explore our latest analyses.
          </p>
          <Link
            href="/"
            style={{ display: 'inline-block', backgroundColor: '#1a2a3a', color: '#fff', fontWeight: 600, fontSize: 14, padding: '12px 28px', borderRadius: 2, textDecoration: 'none' }}
          >
            Start reading →
          </Link>
        </>
      )}
    </div>
  )
}
