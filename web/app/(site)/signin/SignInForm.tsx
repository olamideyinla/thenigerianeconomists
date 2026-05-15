'use client'

import { useState, use } from 'react'
import { signIn } from 'next-auth/react'

interface SignInFormProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: 'Error starting sign-in. Please try again.',
  OAuthCallback: 'Error completing sign-in. Please try again.',
  OAuthCreateAccount: 'Could not create an account. Contact support.',
  EmailCreateAccount: 'Could not create an account. Contact support.',
  Callback: 'Error during callback. Please try again.',
  Verification: 'This sign-in link has expired or already been used. Please request a new one.',
  default: 'Sign-in failed. Please try again.',
}

export function SignInForm({ searchParams }: SignInFormProps) {
  const { callbackUrl, error } = use(searchParams)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState('')

  const errorMsg = error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.default) : localError

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setLocalError('')
    try {
      const res = await signIn('resend', {
        email,
        redirect: false,
        callbackUrl: callbackUrl ?? '/',
      })
      if (res?.error) {
        setLocalError('Failed to send the magic link. Please try again.')
      } else {
        setSubmitted(true)
      }
    } catch {
      setLocalError('Unexpected error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    await signIn('google', { callbackUrl: callbackUrl ?? '/' })
  }

  if (submitted) {
    return (
      <div className="signin-success">
        <p className="signin-success-head">Check your email</p>
        <p className="signin-success-body">
          We sent a link to <strong>{email}</strong>. Click it to sign in — or
          create your account if you&apos;re new.
        </p>
      </div>
    )
  }

  return (
    <div className="signin-form-wrap">
      {errorMsg && (
        <div className="signin-error" role="alert">
          {errorMsg}
        </div>
      )}

      {/* Google OAuth */}
      <button className="signin-google-btn" onClick={handleGoogle} type="button">
        <GoogleIcon />
        Continue with Google — sign in or sign up
      </button>

      <div className="signin-divider">
        <span>or</span>
      </div>

      {/* Magic link */}
      <form onSubmit={handleEmail} className="signin-email-form">
        <label htmlFor="signin-email" className="signin-label">
          Email address
        </label>
        <input
          id="signin-email"
          type="email"
          className="signin-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <button type="submit" className="signin-submit-btn" disabled={loading}>
          {loading ? 'Sending link…' : 'Send sign-in / sign-up link'}
        </button>
      </form>

      <p className="signin-note">
        If you don&apos;t have an account yet, one will be created automatically
        when you click the link we send you. No password needed.
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}
