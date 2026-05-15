'use client'

import { useState } from 'react'

interface Note {
  id: string
  name: string
  text: string
  date: string
  endorsements: number
}

interface ReaderNotesProps {
  articleSlug: string
  initialNotes?: Note[]
}

const MAX_CHARS = 500

export function ReaderNotes({ articleSlug: _articleSlug, initialNotes = [] }: ReaderNotesProps) {
  const [composerOpen, setComposerOpen] = useState(false)
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [name, setName] = useState('')
  const [text, setText] = useState('')

  const remaining = MAX_CHARS - text.length

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !name.trim()) return
    setNotes(prev => [
      {
        id: Date.now().toString(),
        name: name.trim(),
        text: text.trim(),
        date: 'Just now',
        endorsements: 0,
      },
      ...prev,
    ])
    setText('')
    setName('')
    setComposerOpen(false)
  }

  return (
    <section className="notes" aria-label="Reader notes">
      <header className="notes-head">
        <span className="kicker">Reader Notes</span>
        <span className="notes-count">{notes.length} notes</span>
      </header>

      <p className="notes-policy">
        Notes are brief, good-faith responses from readers. They are not moderated
        in real time &#8212; see our{' '}
        <button className="notes-policy-link" type="button">notes policy</button>.
      </p>

      {!composerOpen ? (
        <button
          className="notes-open"
          type="button"
          onClick={() => setComposerOpen(true)}
        >
          <span className="notes-open-plus" aria-hidden="true">+</span>
          Add a note
        </button>
      ) : (
        <form className="notes-form" onSubmit={handleSubmit}>
          <input
            className="notes-name"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={60}
            aria-label="Your name"
            autoFocus
          />
          <textarea
            className="notes-textarea"
            placeholder="Write a brief, good-faith response&#8230;"
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
            maxLength={MAX_CHARS}
            aria-label="Your note"
          />
          <div className="notes-form-foot">
            <span className={`notes-counter${remaining < 60 ? ' low' : ''}`}>
              {remaining} left
            </span>
            <button
              type="button"
              className="notes-cancel"
              onClick={() => setComposerOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="notes-submit"
              disabled={!text.trim() || !name.trim()}
            >
              Publish
            </button>
          </div>
        </form>
      )}

      {notes.length > 0 && (
        <ul className="notes-list">
          {notes.map(note => (
            <li key={note.id} className="note">
              <div className="note-head">
                <span className="note-initial" aria-hidden="true">
                  {note.name[0].toUpperCase()}
                </span>
                <div>
                  <div className="note-name">{note.name}</div>
                  <div className="note-sub">{note.date}</div>
                </div>
                <button
                  className="note-endorse"
                  type="button"
                  aria-label={`Endorse note by ${note.name}`}
                >
                  &#9825; {note.endorsements}
                </button>
              </div>
              <p className="note-body">{note.text}</p>
            </li>
          ))}
        </ul>
      )}

      <p className="notes-fine">
        Notes are subject to our community standards. We reserve the right to remove
        notes that violate these standards without notice.
      </p>
    </section>
  )
}
