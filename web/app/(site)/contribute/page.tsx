import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { ContributeForm } from './ContributeForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Submit your article — The Nigerian Economists',
  description:
    'Contribute rigorous economic analysis and commentary on Nigeria and Africa to The Nigerian Economists.',
}

export default async function ContributePage() {
  const session = await auth()
  const isSignedIn = !!session?.user

  return (
    <div className="page" style={{ maxWidth: '680px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <span className="kicker kicker-accent">For contributors</span>
        <h1 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '2.25rem', fontWeight: 500, lineHeight: 1.1, margin: '0.5rem 0 1rem' }}>
          Submit your article
        </h1>
        <p style={{ fontSize: '1.0625rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>
          We publish rigorous economic analysis and commentary on Nigeria and Africa. If you have
          original research, a well-evidenced argument, or a rebuttal to a published piece, we want
          to hear from you.
        </p>
      </header>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 className="kicker" style={{ marginBottom: '0.75rem' }}>What we publish</h2>
        <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.75, color: 'var(--ink-2)', fontSize: '0.9375rem' }}>
          <li>Data-driven analysis on macroeconomics, fiscal policy, monetary policy, trade, and welfare</li>
          <li>Peer-reviewed or policy-grade research translated for a broad professional audience</li>
          <li>Rebuttals and extensions of published articles, with clear evidence</li>
          <li>Field reports and original survey data from Nigerian economic contexts</li>
        </ul>

        <h2 className="kicker" style={{ marginTop: '1.75rem', marginBottom: '0.75rem' }}>Submission requirements</h2>
        <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.75, color: 'var(--ink-2)', fontSize: '0.9375rem' }}>
          <li>800–5,000 words (data briefs may be shorter)</li>
          <li>At least 5 cited references, using our numbered citation format</li>
          <li>No undisclosed conflicts of interest</li>
          <li>Exclusive first publication rights (not published elsewhere)</li>
        </ul>
      </section>

      <hr className="rule rule-thick" />

      <section style={{ marginTop: '2.5rem' }}>
        <h2 className="kicker" style={{ marginBottom: '1rem' }}>Submit your pitch</h2>

        {isSignedIn ? (
          <ContributeForm userName={session.user?.name ?? ''} userEmail={session.user?.email ?? ''} />
        ) : (
          <div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--ink-2)', marginBottom: '1.25rem', lineHeight: 1.65 }}>
              Please sign in to submit your article. We use your account to track submissions
              and communicate with you about the editorial process.
            </p>
            <Link
              href="/signin?callbackUrl=/contribute"
              className="notes-submit"
              style={{ display: 'inline-block', textDecoration: 'none', padding: '0.6rem 1.5rem', fontSize: '0.875rem' }}
            >
              Sign in to submit &#8594;
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
