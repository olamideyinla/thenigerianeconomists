import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How The Nigerian Economists collects, uses, and protects your personal data in accordance with the NDPR.',
}

export default function PrivacyPage() {
  return (
    <div className="page">
      <article className="article-main" style={{ maxWidth: 680, margin: '0 auto', padding: '40px var(--gutter) 80px' }}>
        <header className="article-head">
          <span className="kicker kicker-accent">Legal</span>
          <h1 className="article-headline">Privacy Policy</h1>
          <p className="article-deck">
            How we collect, use, and protect your personal data — in compliance with Nigeria&rsquo;s
            National Data Protection Regulation (NDPR) and GDPR.
          </p>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 8 }}>
            Last reviewed: <em>pending lawyer review before launch</em>
          </p>
        </header>

        <div className="article-body">
          <p>
            This Privacy Policy describes how The Nigerian Economists (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
            &ldquo;our&rdquo;) handles personal information collected through{' '}
            <strong>thenigerianeconomists.com</strong> and our email newsletter service.
          </p>
          <p style={{ padding: '16px', background: 'var(--veil)', borderLeft: '3px solid var(--accent)', margin: '24px 0' }}>
            <strong>Note:</strong> This page will be replaced with the full, lawyer-approved privacy
            policy before public launch. It is published here to establish the URL structure.
          </p>
          <h2 className="article-h2">Contact</h2>
          <p>
            For data requests or privacy concerns, email{' '}
            <a href="mailto:privacy@thenigerianeconomists.com">privacy@thenigerianeconomists.com</a>.
          </p>
        </div>
      </article>
    </div>
  )
}
