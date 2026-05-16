import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms governing use of The Nigerian Economists website and services.',
}

export default function TermsPage() {
  return (
    <div className="page">
      <article className="article-main" style={{ maxWidth: 680, margin: '0 auto', padding: '40px var(--gutter) 80px' }}>
        <header className="article-head">
          <span className="kicker kicker-accent">Legal</span>
          <h1 className="article-headline">Terms of Service</h1>
          <p className="article-deck">
            The rules governing use of The Nigerian Economists website, content, and services.
          </p>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 8 }}>
            Last reviewed: <em>pending lawyer review before launch</em>
          </p>
        </header>

        <div className="article-body">
          <p>
            By accessing <strong>thenigerianeconomists.com</strong> you agree to these Terms of Service.
            If you do not agree, please do not use the site.
          </p>
          <p style={{ padding: '16px', background: 'var(--veil)', borderLeft: '3px solid var(--accent)', margin: '24px 0' }}>
            <strong>Note:</strong> This page will be replaced with the full, lawyer-approved terms of
            service before public launch.
          </p>
          <h2 className="article-h2">Contact</h2>
          <p>
            Legal enquiries:{' '}
            <a href="mailto:legal@thenigerianeconomists.com">legal@thenigerianeconomists.com</a>.
          </p>
        </div>
      </article>
    </div>
  )
}
