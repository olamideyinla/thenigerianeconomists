'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { SearchHit } from '@/lib/search'

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const router = useRouter()

  // Focus input when opened; reset when closed
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(id)
    } else {
      setQuery('')
      setHits([])
      setLoading(false)
    }
  }, [open])

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Escape key closes
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setHits([]); setLoading(false); return }
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    setLoading(true)
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&limit=8`,
        { signal: abortRef.current.signal },
      )
      const data = await res.json()
      setHits(data.hits ?? [])
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') setHits([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(q), 150)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onClose()
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const clearQuery = () => {
    setQuery('')
    setHits([])
    inputRef.current?.focus()
  }

  return (
    <div
      className={`search-modal ${open ? 'open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Search articles"
      aria-hidden={!open}
    >
      <div className="search-modal-scrim" onClick={onClose} aria-hidden="true" />

      <div className="search-modal-panel">
        <form className="search-input-row" onSubmit={handleSubmit} role="search">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="search-icon">
            <circle cx="7" cy="7" r="5.2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M11 11l3.2 3.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            className="search-input"
            type="search"
            value={query}
            onChange={handleChange}
            placeholder="Search articles, topics, authors…"
            aria-label="Search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {query ? (
            <button
              type="button"
              className="search-dismiss-btn"
              onClick={clearQuery}
              aria-label="Clear search"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              className="search-dismiss-btn"
              onClick={onClose}
              aria-label="Close search"
            >
              <span className="search-esc-label">Esc</span>
            </button>
          )}
        </form>

        <div className="search-modal-results" aria-live="polite">
          {loading && query && (
            <p className="search-status">Searching…</p>
          )}
          {!loading && query && hits.length === 0 && (
            <p className="search-empty">No results for &ldquo;{query}&rdquo;</p>
          )}

          {hits.length > 0 && (
            <ul className="search-hit-list">
              {hits.map(hit => (
                <li key={hit.id}>
                  <Link
                    href={`/articles/${hit.slug}`}
                    className="search-hit"
                    onClick={onClose}
                  >
                    <span className="sh-kicker">{hit.kicker || hit.topicName}</span>
                    <span
                      className="sh-headline"
                      dangerouslySetInnerHTML={{
                        __html: hit._formatted?.headline ?? hit.headline,
                      }}
                    />
                    {(hit._formatted?.deck || hit.deck) && (
                      <span
                        className="sh-deck"
                        dangerouslySetInnerHTML={{
                          __html: hit._formatted?.deck ?? hit.deck,
                        }}
                      />
                    )}
                    <span className="sh-meta">
                      {hit.authorName} · {hit.readMinutes} min read
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {hits.length > 0 && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className="search-see-all"
              onClick={onClose}
            >
              See all results →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
