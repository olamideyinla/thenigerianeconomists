'use client'

import { useState } from 'react'

interface Props {
  userName: string
  userEmail: string
}

export function ContributeForm({ userName, userEmail }: Props) {
  const [fields, setFields] = useState({
    headline: '',
    abstract: '',
    wordCount: '',
    affiliation: '',
    coiDisclosure: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function set(k: string, v: string) {
    setFields((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Submission failed. Please try again.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Unexpected error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{
        padding: '1.5rem',
        background: 'var(--bg-2, #f5f0e8)',
        borderLeft: '3px solid var(--accent)',
        borderRadius: '2px',
      }}>
        <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>Pitch received — thank you.</p>
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>
          Our editors will review your submission and respond to <strong>{userEmail}</strong> within
          five business days. If your pitch is accepted, we will invite you to submit the full article
          through our editorial system.
        </p>
      </div>
    )
  }

  const can = fields.headline.trim() && fields.abstract.trim() && fields.wordCount.trim()

  return (
    <form onSubmit={handleSubmit} className="space-y-4" style={{ maxWidth: '560px' }}>
      <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>
        Submitting as <strong>{userName || userEmail}</strong>
      </p>

      <div className="admin-form-field">
        <label className="admin-form-label" htmlFor="headline">Proposed headline *</label>
        <input
          id="headline"
          className="ref-field"
          value={fields.headline}
          onChange={(e) => set('headline', e.target.value)}
          placeholder="A concise working title for your piece"
          required
        />
      </div>

      <div className="admin-form-field">
        <label className="admin-form-label" htmlFor="abstract">Abstract / pitch (200 words max) *</label>
        <textarea
          id="abstract"
          className="ref-field"
          rows={5}
          value={fields.abstract}
          onChange={(e) => set('abstract', e.target.value)}
          placeholder="Summarise your argument, key evidence, and why it matters for Nigerian economic policy."
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="admin-form-field">
          <label className="admin-form-label" htmlFor="wordCount">Estimated word count *</label>
          <input
            id="wordCount"
            className="ref-field"
            type="number"
            min={400}
            max={5000}
            value={fields.wordCount}
            onChange={(e) => set('wordCount', e.target.value)}
            placeholder="1200"
            required
          />
        </div>

        <div className="admin-form-field">
          <label className="admin-form-label" htmlFor="affiliation">Affiliation / institution</label>
          <input
            id="affiliation"
            className="ref-field"
            value={fields.affiliation}
            onChange={(e) => set('affiliation', e.target.value)}
            placeholder="University of Lagos, CBN, etc."
          />
        </div>
      </div>

      <div className="admin-form-field">
        <label className="admin-form-label" htmlFor="coiDisclosure">
          Conflict of interest disclosure{' '}
          <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>(if none, write &ldquo;None&rdquo;)</span>
        </label>
        <textarea
          id="coiDisclosure"
          className="ref-field"
          rows={2}
          value={fields.coiDisclosure}
          onChange={(e) => set('coiDisclosure', e.target.value)}
          placeholder="e.g. I received a research grant from…"
        />
      </div>

      {error && <p style={{ fontSize: '0.875rem', color: 'var(--error, #b91c1c)' }}>{error}</p>}

      <button
        type="submit"
        className="notes-submit"
        disabled={submitting || !can}
        style={{ padding: '0.6rem 1.75rem', fontSize: '0.875rem' }}
      >
        {submitting ? 'Submitting…' : 'Submit pitch'}
      </button>
    </form>
  )
}
