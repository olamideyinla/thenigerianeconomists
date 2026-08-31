'use client'
import { useState } from 'react'

function plausible(event: string, props?: Record<string, string>) {
  ;(window as unknown as { plausible?: (e: string, o?: { props?: Record<string, string> }) => void })
    .plausible?.(event, props ? { props } : undefined)
}

interface Props {
  /** Where the signup happened, for analytics/segmentation. */
  source?: 'ARTICLE_FOOT' | 'HOMEPAGE' | 'FOOTER'
  /** Optional override for the heading. */
  heading?: string
  /** Optional override for the supporting line. */
  blurb?: string
}

export function InlineSubscribe({
  source = 'ARTICLE_FOOT',
  heading = 'Never miss the next argument',
  blurb = 'Get an email the moment we publish — plus The Synthesis, our weekly briefing on the economics shaping Nigeria.',
}: Props) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Something went wrong. Please try again.')
      } else {
        setSubmitted(true)
        plausible('Newsletter Signup', { source })
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="inline-sub" aria-label="Newsletter signup">
      <span className="kicker">Stay in the loop</span>
      {submitted ? (
        <>
          <h3 className="inline-sub-head">Check your inbox.</h3>
          <p className="inline-sub-blurb">
            We&#8217;ve sent a confirmation link to <strong>{email}</strong>. Click it and
            you&#8217;ll be notified with every new piece.
          </p>
        </>
      ) : (
        <>
          <h3 className="inline-sub-head">{heading}</h3>
          <p className="inline-sub-blurb">{blurb}</p>
          <form className="inline-sub-form" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              placeholder="you@inbox.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="inline-sub-input"
              disabled={loading}
              aria-label="Email address"
            />
            <button type="submit" className="inline-sub-btn" disabled={loading}>
              {loading ? 'Subscribing…' : 'Notify me'}
            </button>
          </form>
          {error && <p className="inline-sub-error">{error}</p>}
          <p className="inline-sub-fine">
            No spam. Unsubscribe in one click from any email.
          </p>
        </>
      )}
    </section>
  )
}
