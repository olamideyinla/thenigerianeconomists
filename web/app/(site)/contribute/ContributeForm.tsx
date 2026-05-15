'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

// SSR disabled — Tiptap uses browser APIs (contenteditable, clipboard)
const RichArticleEditor = dynamic(
  () => import('@/components/contribute/RichArticleEditor').then(m => m.RichArticleEditor),
  { ssr: false, loading: () => <div className="contribute-rich-loading">Loading editor…</div> }
)

interface Props {
  userName: string
  userEmail: string
}

/** Strip HTML tags and entities, then count whitespace-delimited words. */
function countWordsHtml(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-zA-Z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!text) return 0
  return text.split(/\s+/).filter(Boolean).length
}

export function ContributeForm({ userName, userEmail }: Props) {
  const [headline, setHeadline] = useState('')
  const [deck, setDeck] = useState('')
  const [body, setBody] = useState('')   // stores HTML from rich editor
  const [affiliation, setAffiliation] = useState('')
  const [coi, setCoi] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const wordCount = countWordsHtml(body)
  const wordCountOk = wordCount >= 800 && wordCount <= 7000
  const canSubmit = headline.trim().length > 0 && deck.trim().length > 0 && body.trim().length > 0 && wordCountOk

  const wordCountColor =
    wordCount === 0   ? 'var(--ink-faint, #bbb)'
    : wordCount < 800  ? '#b45309'
    : wordCount > 7000 ? '#b91c1c'
    : '#15803d'

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

      {/* Article body — rich text editor */}
      <div className="contribute-field">
        <div className="contribute-label-row">
          <label className="contribute-label">
            Article <span className="contribute-req">*</span>
          </label>
          <span className="contribute-wordcount" style={{ color: wordCountColor }}>
            {wordCount === 0 ? '800–7,000 words required' : `${wordCount.toLocaleString()} words`}
          </span>
        </div>
        <RichArticleEditor
          onChange={setBody}
          placeholder="Type or paste your article here. Tables and images are preserved. Use [1], [2] for citations."
        />
        {wordCount > 0 && !wordCountOk && (
          <p className="contribute-hint" style={{ color: wordCountColor }}>
            {wordCount < 800
              ? `${800 - wordCount} more words needed.`
              : `${wordCount - 7000} words over the 7,000-word limit.`}
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
