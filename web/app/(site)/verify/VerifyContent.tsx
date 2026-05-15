'use client'

// Client component — reads the callback URL from the browser's URL bar at
// runtime via useSearchParams(). The token URL is NEVER written into the
// static HTML, so email scanners (Gmail, Outlook SafeLinks, etc.) cannot
// extract and pre-fetch it. Only a real user clicking the button triggers
// the navigation.

import { useSearchParams } from 'next/navigation'

export default function VerifyContent() {
  const params = useSearchParams()
  const to = params.get('to') ?? ''
  const isValid = to.startsWith('/api/auth/callback/')

  return (
    <>
      <h1 className="verify-title">Sign in to your account</h1>

      {isValid ? (
        <>
          <p className="verify-body">
            Click the button below to complete your sign-in. This link is
            single-use and will expire after 24 hours.
          </p>
          <button
            type="button"
            className="verify-btn"
            onClick={() => { window.location.href = to }}
          >
            Sign in &rarr;
          </button>
        </>
      ) : (
        <p className="verify-body verify-invalid">
          This link is invalid or has already been used. Please request a
          new sign-in link.
        </p>
      )}
    </>
  )
}
