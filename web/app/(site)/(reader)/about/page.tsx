import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'The Nigerian Economists \u2014 rigorous economic commentary on Nigeria and Africa.',
}

export default function AboutPage() {
  return (
    <div className="page page-topic">
      <header className="topic-head">
        <span className="kicker kicker-accent">About</span>
        <h1 className="topic-title">The Nigerian Economists</h1>
        <p className="topic-deck">
          Rigorous economic commentary on Nigeria and Africa. Inline references in every piece.
          Rebuttals only as full articles. Edited in Lagos.
        </p>
      </header>

      <div className="synth-editorial" style={{ paddingLeft: 'var(--gutter)', paddingRight: 'var(--gutter)' }}>
        <p>
          The Nigerian Economists publishes economic analysis and commentary that meets the
          standards of academic rigour without requiring the reader to be an economist. Every
          factual claim carries an inline reference. Every significant rebuttal is published
          as a full article, peer-reviewed by our editorial board.
        </p>
        <p>
          We are a reader-supported independent publication. We accept no advertising and
          maintain a public register of all funders. Our editorial decisions are made
          entirely by our editors and are not subject to funder approval or review.
        </p>
        <p>
          Founded in Lagos in 2024, we cover monetary policy, fiscal policy, development
          economics, banking and finance, labour economics, trade, and political economy
          as it intersects with economic policy.
        </p>
      </div>

      <hr className="rule rule-thick" />

      <section style={{ padding: '0 var(--gutter) 24px' }}>
        <span className="kicker">Contact</span>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: '1.5', color: 'var(--ink)', marginTop: '12px' }}>
          For editorial enquiries: <a href="mailto:editors@thenigerianeconomists.com" style={{ color: 'var(--accent)' }}>editors@thenigerianeconomists.com</a>
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: '1.5', color: 'var(--ink)' }}>
          For rebuttal submissions: <a href="mailto:submissions@thenigerianeconomists.com" style={{ color: 'var(--accent)' }}>submissions@thenigerianeconomists.com</a>
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: '1.5', color: 'var(--ink)' }}>
          For corrections: <a href="mailto:corrections@thenigerianeconomists.com" style={{ color: 'var(--accent)' }}>corrections@thenigerianeconomists.com</a>
        </p>
      </section>
    </div>
  )
}
