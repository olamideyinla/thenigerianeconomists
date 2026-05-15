'use client'

import { useState, useCallback } from 'react'

interface Props {
  userName: string
  userEmail: string
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function ContributeForm({ userName, userEmail }: Props) {
  const [headline, setHeadline] = useState('')
  const [deck, setDeck] = useState('')
  const [body, setBody] = useState('')
  const [affiliation, setAffiliation] = useState('')
  const [coi, setCoi] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const wordCount = countWords(body)
  const wordCountOk = wordCount >= 800 && wordCount <= 5000
  const canSubmit = headline.trim().length > 0 && deck.trim().length > 0 && body.trim().length > 0 && wordCountOk

  const wordCountColor =
    wordCount === 0 ? 'var(--ink-faint, #bbb)'
    : wordCount < 800 ? '#b45309'
    : wordCount > 5000 ? '#b91c1c'
    : '#15803d'

  const handleBodyChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, deck, body, affiliation, coiDisclosure: coi }),
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
      <div className="contribute-success">
        <p className="contribute-success-head">Article received — thank you.</p>
        <p className="contribute-success-body">
          Our editors will review your submission and respond to <strong>{userEmail}</strong> within
          five business days.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="contribute-form">
      <p className="contribute-byline">
        Submitting as <strong>{userName || userEmail}</strong>
      </p>

      {/* Headline */}
      <div className="contribute-field">
        <label className="contribute-label" htmlFor="cf-headline">
          Proposed headline <span className="contribute-req">*</span>
        </label>
        <input
          id="cf-headline"
          className="contribute-input"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="A concise working title for your piece"
          required
          maxLength={200}
        />
      </div>

      {/* Deck / subtitle */}
      <div className="contribute-field">
        <label className="contribute-label" htmlFor="cf-deck">
          Subtitle / standfirst <span className="contribute-req">*</span>
        </label>
        <input
          id="cf-deck"
          className="contribute-input"
          value={deck}
          onChange={(e) => setDeck(e.target.value)}
          placeholder="One sentence that expands on your headline and draws the reader in"
          required
          maxLength={300}
        />
        <p className="contribute-hint">This appears directly beneath the headline in the published article.</p>
      </div>

      {/* Article body */}
      <div className="contribute-field">
        <div className="contribute-label-row">
          <label className="contribute-label" htmlFor="cf-body">
            Article <span className="contribute-req">*</span>
          </label>
          <span className="contribute-wordcount" style={{ color: wordCountColor }}>
            {wordCount === 0 ? '800–5,000 words required' : `${wordCount.toLocaleString()} words`}
          </span>
        </div>
        <textarea
          id="cf-body"
          className="contribute-body"
          value={body}
          onChange={handleBodyChange}
          placeholder="Type or paste your article here. Include your argument, evidence, and numbered citations in the form [1], [2], etc. Figures can be described in square brackets, e.g. [Figure 1: GDP growth chart]."
          required
          rows={24}
          spellCheck
        />
        {wordCount > 0 && !wordCountOk && (
          <p className="contribute-hint" style={{ color: wordCountColor }}>
            {wordCount < 800
              ? `${800 - wordCount} more words needed.`
              : `${wordCount - 5000} words over the 5,000-word limit.`}
          </p>
        )}
      </div>

      {/* Metadata row */}
      <div className="contribute-row-2">
        <div className="contribute-field">
          <label className="contribute-label" htmlFor="cf-affiliation">Affiliation / institution</label>
          <input
            id="cf-affiliation"
            className="contribute-input"
            value={affiliation}
            onChange={(e) => setAffiliation(e.target.value)}
            placeholder="University of Lagos, CBN, etc."
          />
        </div>

        <div className="contribute-field">
          <label className="contribute-label" htmlFor="cf-coi">
            Conflict of interest{' '}
            <span className="contribute-hint-inline">(write &ldquo;None&rdquo; if not applicable)</span>
          </label>
          <input
            id="cf-coi"
            className="contribute-input"
            value={coi}
            onChange={(e) => setCoi(e.target.value)}
            placeholder="e.g. I received a grant from…"
          />
        </div>
      </div>

      {error && <p className="contribute-error">{error}</p>}

      <button
        type="submit"
        className="contribute-submit"
        disabled={submitting || !canSubmit}
      >
        {submitting ? 'Submitting…' : 'Submit article'}
      </button>
    </form>
  )
}
