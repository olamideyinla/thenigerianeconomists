import type { Metadata } from 'next'
import { SignInForm } from './SignInForm'

export const metadata: Metadata = { title: 'Sign in or create account' }

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
          <h1 className="signin-title">Sign in or create an account</h1>
          <p className="signin-desc">
            New to The Nigerian Economists? Enter your email below — we will create
            your account and send you a sign-in link in one step. No password required.
          </p>
        </header>
        <SignInForm searchParams={searchParams} />
      </div>
    </div>
  )
}
