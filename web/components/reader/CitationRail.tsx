'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { RefItem } from '@/context/ReferenceContext'

interface CitationRailProps {
  refs: RefItem[]
}

/**
 * Desktop-only side rail (visible at ≥1024px via CSS).
 * Tracks which citation the reader has scrolled past using
 * IntersectionObserver on [data-cite-n] markers in the article body.
 * Also listens for citation:toggle events dispatched by Citation components
 * so the rail reflects which reference is currently expanded.
 */
export function CitationRail({ refs }: CitationRailProps) {
  const [activeN, setActiveN] = useState<number | null>(null)
  const [openN, setOpenN] = useState<number | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // IntersectionObserver: highlight the most-recently-visible citation
  useEffect(() => {
    const visibleCitations = new Map<number, number>() // n → intersectionRatio

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const n = Number(
            (entry.target as HTMLElement).dataset.citeN
          )
          if (!n) continue
          if (entry.isIntersecting) {
            visibleCitations.set(n, entry.intersectionRatio)
          } else {
            visibleCitations.delete(n)
          }
        }
        if (visibleCitations.size > 0) {
          // Pick the highest-ratio visible citation
          let best = 0
          let bestRatio = -1
          for (const [n, ratio] of visibleCitations) {
            if (ratio > bestRatio) {
              bestRatio = ratio
              best = n
            }
          }
          setActiveN(best)
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1.0], rootMargin: '-10% 0px -50% 0px' }
    )

    // Observe all citation markers in the article body
    const markers = document.querySelectorAll<HTMLElement>('[data-cite-n]')
    for (const el of markers) {
      observerRef.current.observe(el)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  // Listen for Citation component toggle events
  useEffect(() => {
    const handler = (e: Event) => {
      const { n, open } = (e as CustomEvent<{ n: number; open: boolean }>).detail
      setOpenN(open ? n : null)
    }
    window.addEventListener('citation:toggle', handler)
    return () => window.removeEventListener('citation:toggle', handler)
  }, [])

  const handleSelect = useCallback((n: number) => {
    // Scroll the in-text citation marker into view
    const marker = document.querySelector<HTMLElement>(`[data-cite-n="${n}"]`)
    marker?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setOpenN(n)
  }, [])

  if (refs.length === 0) return null

  return (
    <aside className="citation-rail" aria-label="References — live">
      <header className="rail-head">
        <span className="kicker">References</span>
        <span className="rail-count">{refs.length}</span>
      </header>
      <ol className="rail-list">
        {refs.map((r, i) => {
          const n = i + 1
          const isActive = activeN === n
          const isOpen = openN === n
          return (
            <li
              key={n}
              className={[
                'rail-item',
                isActive ? 'active' : '',
                isOpen ? 'open' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <button
                className="rail-btn"
                type="button"
                onClick={() => handleSelect(n)}
                aria-label={`Jump to reference ${n}: ${r.author}`}
              >
                <span className="rail-num">{String(n).padStart(2, '0')}</span>
                <span className="rail-body">
                  <span className="rail-author">{r.author}</span>
                  <span className="rail-year"> ({r.year})</span>
                  <span className="rail-title-line">{r.title}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      <p className="rail-note">
        References light up as you read past their anchor. Click any to jump.
      </p>
    </aside>
  )
}
