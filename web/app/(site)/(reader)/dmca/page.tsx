import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DMCA & Copyright',
  description: 'Copyright policy and DMCA takedown procedure for The Nigerian Economists.',
}

export default function DmcaPage() {
  return (
    <div className="page">
      <article className="article-main" style={{ maxWidth: 680, margin: '0 auto', padding: '40px var(--gutter) 80px' }}>
        <header className="article-head">
          <span className="kicker kicker-accent">Legal</span>
          <h1 className="article-headline">DMCA &amp; Copyright</h1>
          <p className="article-deck">
            Our copyright policy and the procedure for submitting a takedown notice.
          </p>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 8 }}>
            Last reviewed: <em>pending lawyer review before launch</em>
          </p>
        </header>

        <div className="article-body">
          <p>
            All original content on <strong>thenigerianeconomists.com</strong> is copyright
            &copy; The Nigerian Economists unless otherwise stated. All rights reserved.
          </p>
          <p style={{ padding: '16px', background: 'var(--veil)', borderLeft: '3px solid var(--accent)', margin: '24px 0' }}>
            <strong>Note:</strong> This page will be replaced with the full, lawyer-approved DMCA and
            copyright policy before public launch.
          </p>
          <h2 className="article-h2">Copyright takedown requests</h2>
          <p>
            If you believe material on this site infringes your copyright, send a takedown notice to{' '}
            <a href="mailto:copyright@thenigerianeconomists.com">copyright@thenigerianeconomists.com</a>{' '}
            with: (1) identification of the copyrighted work; (2) identification of the infringing
            material and its location; (3) your contact information; (4) a statement of good faith
            belief; (5) a statement of accuracy under penalty of perjury; and (6) your signature.
          </p>
          <h2 className="article-h2">Republication</h2>
          <p>
            Requests to republish articles should be directed to{' '}
            <a href="mailto:editorial@thenigerianeconomists.com">editorial@thenigerianeconomists.com</a>.
          </p>
        </div>
      </article>
    </div>
  )
}
