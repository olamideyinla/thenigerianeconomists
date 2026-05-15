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
    <div className="page page-contribute">
      <header className="contribute-header">
        <span className="kicker kicker-accent">For contributors</span>
        <h1 className="contribute-title">Submit your article</h1>
        <p className="contribute-desc">
          We publish rigorous economic analysis and commentary on Nigeria and Africa. If you have
          original research, a well-evidenced argument, or a rebuttal to a published piece, we
          want to hear from you.
        </p>
      </header>

      <div className="contribute-guidelines">
        <div className="contribute-guideline-col">
          <h2 className="contribute-guide-head">What we publish</h2>
          <ul className="contribute-list">
            <li>Data-driven analysis on macroeconomics, fiscal policy, monetary policy, trade, and welfare</li>
            <li>Policy-grade research translated for a broad professional audience</li>
            <li>Rebuttals and extensions of published articles, with clear evidence</li>
            <li>Field reports and original survey data from Nigerian economic contexts</li>
          </ul>
        </div>
        <div className="contribute-guideline-col">
          <h2 className="contribute-guide-head">Requirements</h2>
          <ul className="contribute-list">
            <li>800–5,000 words (data briefs may be shorter)</li>
            <li>At least 5 numbered citations, e.g. [1], [2]</li>
            <li>No undisclosed conflicts of interest</li>
            <li>Exclusive first publication rights — not published elsewhere</li>
          </ul>
        </div>
      </div>

      <hr className="rule rule-thick" />

      <section className="contribute-form-section">
        {isSignedIn ? (
          <ContributeForm
            userName={session.user?.name ?? ''}
            userEmail={session.user?.email ?? ''}
          />
        ) : (
          <div className="contribute-signin-prompt">
            <p className="contribute-signin-text">
              Please sign in to submit your article. We use your account to track submissions
              and communicate with you about the editorial process.
            </p>
            <Link
              href="/signin?callbackUrl=/contribute"
              className="contribute-submit"
              style={{ display: 'inline-block', textDecoration: 'none' }}
            >
              Sign in to submit &rarr;
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
