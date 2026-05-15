// Verification gate — protects magic-link tokens from being consumed by
// email scanners (e.g. Gmail's link-preview crawler) before the user clicks.
//
// The magic-link email links here instead of directly to the NextAuth callback.
// This page does NOT auto-redirect; the user must click the button, which is
// an action that email crawlers will not perform.

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sign in — The Nigerian Economists' }

interface Props {
  searchParams: Promise<{ to?: string }>
}

export default async function VerifyPage({ searchParams }: Props) {
  const { to } = await searchParams

  // Reject empty, non-relative, or clearly invalid destinations.
  const isValid = typeof to === 'string' && to.startsWith('/api/auth/callback/')

  return (
    <div className="page page-verify">
      <div className="verify-shell">
        <p className="verify-pub">The Nigerian Economists</p>
        <h1 className="verify-title">Sign in to your account</h1>

        {isValid ? (
          <>
            <p className="verify-body">
              Click the button below to complete your sign-in. This link is
              single-use and will expire after 24 hours.
            </p>
            <a href={to} className="verify-btn">
              Sign in &rarr;
            </a>
          </>
        ) : (
          <p className="verify-body verify-invalid">
            This link is invalid or has already been used. Please request a
            new sign-in link.
          </p>
        )}
      </div>
    </div>
  )
}
