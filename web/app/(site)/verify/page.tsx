// Verification gate — protects magic-link tokens from being consumed by
// email scanners (e.g. Gmail's link-preview crawler) before the user clicks.
//
// The magic-link email links here instead of directly to the NextAuth callback.
// The callback URL is read at runtime via useSearchParams() in VerifyContent
// (a Client Component), so it is never present in static HTML for scanners
// to extract and pre-fetch.

import type { Metadata } from 'next'
import { Suspense } from 'react'
import VerifyContent from './VerifyContent'

export const metadata: Metadata = { title: 'Sign in — The Nigerian Economists' }

export default function VerifyPage() {
  return (
    <div className="page page-verify">
      <div className="verify-shell">
        <p className="verify-pub">The Nigerian Economists</p>
        <Suspense fallback={<p className="verify-body">Loading&hellip;</p>}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  )
}
