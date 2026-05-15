'use client'

import { useState, useRef } from 'react'
import { formatDate } from '@/lib/format'

interface NoteItem {
  id: string
  body: string
  createdAt: string
  userId: string
  userName: string
}

interface ReaderNotesProps {
  initialNotes: NoteItem[]
  totalCount: number
  articleSlug: string
  isAuthenticated: boolean
  currentUserId?: string
}

export function ReaderNotes({
  initialNotes,
  totalCount,
  articleSlug,
  isAuthenticated,
  currentUserId,
}: ReaderNotesProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [total, setTotal] = useState(totalCount)
  const [composing, setComposing] = useState(false)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const remaining = 600 - body.length

  function openComposer() {
    setComposing(true)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/articles/${articleSlug}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      })
      if (res.ok) {
        setSubmitted(true)
        setComposing(false)
        setBody('')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLoadMore() {
    setLoadingMore(true)
    try {
      const res = await fetch(
        `/api/articles/${articleSlug}/notes?offset=${notes.length}&limit=10`
      )
      if (res.ok) {
        const data = await res.json() as { notes: NoteItem[]; total: number }
        setNotes((prev) => [...prev, ...data.notes])
        setTotal(data.total)
      }
    } finally {
      setLoadingMore(false)
    }
  }

  const callbackUrl =
    typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''

  return (
    <section className="notes">
      <header className="notes-head">
        <h2 className="home-section-title">Reader notes</h2>
        {total > 0 && <span className="notes-count">{total} approved</span>}
      </header>

      <p className="notes-policy">
        Notes are moderated and published at editors&#8217; discretion. By submitting
        you agree to our{' '}
        <button type="button" className="notes-policy-link">
          community guidelines
        </button>
        .
      </p>

      {/* Submission confirmation */}
      {submitted && (
        <p className="notes-policy" style={{ borderLeftColor: 'var(--accent)' }}>
          Your note has been submitted and is pending editorial review. Thank you.
        </p>
      )}

      {/* Composer trigger */}
      {!composing && !submitted && (
        isAuthenticated ? (
          <button type="button" className="notes-open" onClick={openComposer}>
            <span className="notes-open-plus">+</span>
            Add a note
          </button>
        ) : (
          <a
            href={`/signin?callbackUrl=${callbackUrl}`}
            className="notes-open"
            style={{ textDecoration: 'none' }}
          >
            <span className="notes-open-plus">+</span>
            Sign in to add a note
          </a>
        )
      )}

      {/* Composer form */}
      {composing && (
        <form className="notes-form" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className="notes-textarea"
            placeholder="Write a note about this article…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            maxLength={600}
          />
          <div className="notes-form-foot">
            <span className={`notes-counter${remaining < 80 ? ' low' : ''}`}>
              {remaining} remaining
            </span>
            <button
              type="button"
              className="notes-cancel"
              onClick={() => { setComposing(false); setBody('') }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="notes-submit"
              disabled={submitting || !body.trim()}
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      )}

      {/* Approved notes list */}
      {notes.length > 0 && (
        <ul className="notes-list">
          {notes.map((note) => {
            const isMine = note.userId === currentUserId
            const initial = (note.userName.charAt(0) || 'R').toUpperCase()
            return (
              <li key={note.id} className={`note${isMine ? ' mine' : ''}`}>
                <div className="note-head">
                  <span className="note-initial">{initial}</span>
                  <div>
                    <div className="note-name">
                      {note.userName}
                      {isMine && <span className="note-mine"> · You</span>}
                    </div>
                    <div className="note-sub">{formatDate(note.createdAt)}</div>
                  </div>
                </div>
                <p className="note-body">{note.body}</p>
              </li>
            )
          })}
        </ul>
      )}

      {/* Load more */}
      {notes.length < total && (
        <button
          type="button"
          className="notes-more"
          onClick={handleLoadMore}
          disabled={loadingMore}
        >
          {loadingMore
            ? 'Loading…'
            : `Load ${total - notes.length} more note${total - notes.length !== 1 ? 's' : ''}`}
        </button>
      )}

      {notes.length === 0 && !composing && !submitted && (
        <p className="notes-fine">
          {isAuthenticated
            ? 'No notes yet. Be the first to add one.'
            : 'No notes yet. Sign in to be the first.'}
        </p>
      )}
    </section>
  )
}
