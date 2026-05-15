'use client'
import { useState } from 'react'

export function NewsletterForm() {
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
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong. Please try again.')
      } else {
        setSubmitted(true)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="news-thanks">
        <span className="kicker kicker-accent">Confirmed</span>
        <h2>One more step: check your inbox.</h2>
        <p>We&#8217;ve sent a confirmation link to <strong>{email}</strong>. Click it and you&#8217;ll be on the list.</p>
        <p className="news-fine">If it doesn&#8217;t arrive within five minutes, check spam.</p>
      </div>
    )
  }

  return (
    <form className="news-form" onSubmit={handleSubmit}>
      <label htmlFor="nl-email" className="news-label">Email address</label>
      <input
        id="nl-email" type="email" required
        placeholder="you@inbox.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="news-input"
        disabled={loading}
      />
      <fieldset className="news-prefs">
        <legend className="kicker">Also send me</legend>
        <label><input type="checkbox" defaultChecked /><span>The Synthesis (fortnightly)</span></label>
        <label><input type="checkbox" defaultChecked /><span>New rebuttal threads</span></label>
        <label><input type="checkbox" /><span>Public corrections</span></label>
        <label><input type="checkbox" /><span>Quarterly funders &amp; transparency update</span></label>
      </fieldset>
      {error && <p style={{ color: 'var(--accent)', fontFamily: 'var(--font-meta)', fontSize: '13px' }}>{error}</p>}
      <button type="submit" className="news-submit" disabled={loading}>
        {loading ? 'Subscribing\u2026' : 'Subscribe'}
      </button>
      <p className="news-fine">
        We will never sell your email. Unsubscribe in one click from any letter.
      </p>
    </form>
  )
}
