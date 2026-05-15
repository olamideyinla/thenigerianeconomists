'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await signIn('resend', {
        email,
        redirect: false,
        callbackUrl: '/admin',
      })
      if (result?.error) {
        setError('Failed to send magic link. Please try again.')
      } else {
        setSubmitted(true)
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-fraunces)' }}>
            The Nigerian Economists
          </h1>
          <p className="mt-2 text-sm text-gray-600">Editorial admin — sign in to continue</p>
        </div>

        {submitted ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
            <p className="text-sm font-medium text-green-800">Check your email</p>
            <p className="mt-1 text-sm text-green-700">
              We sent a magic link to <strong>{email}</strong>. Click it to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="editor@thenigerianeconomists.com"
                required
                autoComplete="email"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending link…' : 'Send magic link'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
