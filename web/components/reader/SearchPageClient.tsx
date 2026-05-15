'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { SearchHit } from '@/lib/search'

const TOPICS = [
  { slug: 'fx',          name: 'FX & Monetary Policy' },
  { slug: 'fiscal',      name: 'Fiscal Policy' },
  { slug: 'banking',     name: 'Banking & Finance' },
  { slug: 'behavioural', name: 'Behavioural Economics' },
  { slug: 'political',   name: 'Political Economy' },
  { slug: 'welfare',     name: 'Welfare Economics' },
  { slug: 'subsidy',     name: 'Subsidy & Energy' },
  { slug: 'capital',     name: 'Capital Markets' },
  { slug: 'labour',      name: 'Labour & Inflation' },
  { slug: 'subnation',   name: 'Subnational' },
  { slug: 'trade',       name: 'Trade & AfCFTA' },
  { slug: 'health',      name: 'Health Economics' },
]

interface SearchPageClientProps {
  initialQuery: string
  initialTopic: string
}

export function SearchPageClient({ initialQuery, initialTopic }: SearchPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(initialQuery)
  const [topic, setTopic] = useState(initialTopic)
  const [hits, setHits] = useState<SearchHit[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const doSearch = useCallback(async (q: string, t: string) => {
    if (!q.trim()) {
      setHits([])
      setTotal(0)
      setLoading(false)
      return
    }
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    setLoading(true)
    try {
      const params = new URLSearchParams({ q, limit: '20' })
      if (t) params.set('topic', t)
      const res = await fetch(`/api/search?${params}`, { signal: abortRef.current.signal })
      const data = await res.json()
      setHits(data.hits ?? [])
      setTotal(data.totalHits ?? 0)
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') { setHits([]); setTotal(0) }
    } finally {
      setLoading(false)
    }
  }, [])

  // Run initial search if URL has a query
  useEffect(() => {
    inputRef.current?.focus()
    if (initialQuery) doSearch(initialQuery, initialTopic)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleSearch = (q: string, t: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(q, t), 150)
  }

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    const next = new URLSearchParams(searchParams.toString())
    if (q) next.set('q', q); else next.delete('q')
    router.replace(`/search?${next}`, { scroll: false })
    scheduleSearch(q, topic)
  }

  const handleTopicToggle = (slug: string) => {
    const newTopic = slug === topic ? '' : slug
    setTopic(newTopic)
    const next = new URLSearchParams(searchParams.toString())
    if (newTopic) next.set('topic', newTopic); else next.delete('topic')
    router.replace(`/search?${next}`, { scroll: false })
    if (timerRef.current) clearTimeout(timerRef.current)
    doSearch(query, newTopic)
  }

  const activeTopic = TOPICS.find(t => t.slug === topic)

  return (
    <>
      {/* Input */}
      <div className="sp-input-wrap">
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="sp-search-icon">
          <circle cx="7" cy="7" r="5.2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M11 11l3.2 3.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          className="sp-input"
          type="search"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search articles, topics, authors…"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>

      {/* Topic filter chips */}
      <div className="sp-filters" role="group" aria-label="Filter by topic">
        {TOPICS.map(t => (
          <button
            key={t.slug}
            className={`sp-chip ${topic === t.slug ? 'active' : ''}`}
            type="button"
            onClick={() => handleTopicToggle(t.slug)}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Result count */}
      {query && (
        <p className="sp-count">
          {loading
            ? 'Searching…'
            : `${total.toLocaleString()} result${total !== 1 ? 's' : ''} for \u201c${query}\u201d${activeTopic ? ` in ${activeTopic.name}` : ''}`
          }
        </p>
      )}

      {/* Results */}
      {hits.length > 0 && (
        <ul className="sp-results" aria-live="polite">
          {hits.map(hit => (
            <li key={hit.id} className="sp-result-item">
              <Link href={`/articles/${hit.slug}`} className="sp-result">
                <span className="sp-kicker">{hit.kicker || hit.topicName}</span>
                <h2
                  className="sp-headline"
                  dangerouslySetInnerHTML={{ __html: hit._formatted?.headline ?? hit.headline }}
                />
                <p
                  className="sp-deck"
                  dangerouslySetInnerHTML={{ __html: hit._formatted?.deck ?? hit.deck }}
                />
                {hit._formatted?.contentText && (
                  <p
                    className="sp-snippet"
                    dangerouslySetInnerHTML={{ __html: `\u2026${hit._formatted.contentText}\u2026` }}
                  />
                )}
                <span className="sp-meta">
                  {hit.authorName} · {hit.readMinutes} min read
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!query && (
        <p className="sp-prompt">Start typing to search all published articles.</p>
      )}

      {query && !loading && hits.length === 0 && (
        <p className="sp-prompt">No results for &ldquo;{query}&rdquo;. Try a different term.</p>
      )}
    </>
  )
}
