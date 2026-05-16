import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How The Nigerian Economists uses cookies and similar technologies.',
}

export default function CookiesPage() {
  return (
    <div className="page">
      <article className="article-main" style={{ maxWidth: 680, margin: '0 auto', padding: '40px var(--gutter) 80px' }}>
        <header className="article-head">
          <span className="kicker kicker-accent">Legal</span>
          <h1 className="article-headline">Cookie Policy</h1>
          <p className="article-deck">
            What cookies we set, why, and how to control them.
          </p>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 8 }}>
            Last reviewed: <em>pending lawyer review before launch</em>
          </p>
        </header>

        <div className="article-body">
          <p>
            We use a small number of cookies strictly necessary to operate the site and remember
            your session. We use Plausible Analytics, which is cookieless and GDPR-compliant
            by design and does not use any cookies or collect personal data.
          </p>
          <p style={{ padding: '16px', background: 'var(--veil)', borderLeft: '3px solid var(--accent)', margin: '24px 0' }}>
            <strong>Note:</strong> This page will be replaced with the full, lawyer-approved cookie
            policy before public launch.
          </p>
          <h2 className="article-h2">Essential cookies</h2>
          <p>
            We set one session cookie (<code>authjs.session-token</code>) when you sign in. It is
            deleted when your session expires or you sign out.
          </p>
          <h2 className="article-h2">Analytics</h2>
          <p>
            We use <a href="https://plausible.io" target="_blank" rel="noopener noreferrer">Plausible Analytics</a>,
            a privacy-friendly, cookieless analytics service. No personal data is collected and no
            cookie is set.
          </p>
        </div>
      </article>
    </div>
  )
}
