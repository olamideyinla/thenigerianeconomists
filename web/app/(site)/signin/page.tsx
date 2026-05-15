import type { Metadata } from 'next'
import { SignInForm } from './SignInForm'

export const metadata: Metadata = { title: 'Sign in' }

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}) {
  return (
    <div className="page page-signin">
      <div className="signin-shell">
        <header className="signin-head">
          <p className="signin-pub">The Nigerian Economists</p>
          <h1 className="signin-title">Sign in to your account</h1>
          <p className="signin-desc">
            Use your email to receive a magic link, or sign in with Google.
          </p>
        </header>
        <SignInForm searchParams={searchParams} />
      </div>
    </div>
  )
}
