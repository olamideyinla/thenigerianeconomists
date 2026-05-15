'use client'

import {
  useContext,
  useState,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { ReferenceContext, type RefItem } from '@/context/ReferenceContext'
import { CiteInline } from './CiteInline'
import { CiteSheet } from './CiteSheet'
import { CiteFootnote } from './CiteFootnote'

// Re-export so existing importers of CitationRef don't break
export type { RefItem as CitationRef }

type CitationStyle = 'inline' | 'sheet' | 'footnote'

const LS_KEY = 'citeStyle'

interface CitationProps {
  n: number
}

/**
 * Self-contained citation marker.
 *
 * - Reads the matching reference from ReferenceContext (provided by the
 *   article page's ArticleClientShell).
 * - Manages its own open/close state.
 * - Respects the reader's preferred expansion style stored in localStorage
 *   (inline | sheet | footnote).  Defaults to 'inline'.
 * - Renders the expansion panel via a React portal into document.body so the
 *   panel is never trapped inside a <p> element (which would produce invalid
 *   HTML when Inline/Footnote panels are block-level).
 * - On wide screens the CitationRail also highlights the active reference via
 *   a custom DOM event.
 */
export function Citation({ n }: CitationProps) {
  const refs = useContext(ReferenceContext)
  const [open, setOpen] = useState(false)
  const [style, setStyle] = useState<CitationStyle>('inline')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved === 'inline' || saved === 'sheet' || saved === 'footnote') {
        setStyle(saved)
      }
    } catch {
      // localStorage unavailable (e.g. SSR, private mode)
    }
  }, [])

  const ref: RefItem | undefined = refs[n - 1]

  const close = useCallback(() => setOpen(false), [])

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev
      // Notify CitationRail about the active citation
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('citation:toggle', { detail: { n, open: next } })
        )
      }
      return next
    })
  }, [n])

  const jumpToRef = useCallback(
    (refN: number) => {
      document
        .getElementById(`ref-${refN}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      close()
    },
    [close]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Escape' && open) close()
    },
    [open, close]
  )

  // If the reference doesn't exist, degrade gracefully
  if (!ref) {
    return (
      <span className="cite-wrap cite-missing" aria-label={`Reference ${n} not found`}>
        <sup className="cite-marker">[{n}]</sup>
      </span>
    )
  }

  const expansion =
    open && mounted
      ? createPortal(
          style === 'sheet' ? (
            <CiteSheet n={n} cite={ref} onClose={close} onJump={jumpToRef} />
          ) : style === 'footnote' ? (
            <CiteFootnote n={n} cite={ref} onClose={close} />
          ) : (
            <CiteInline n={n} cite={ref} onClose={close} onJump={jumpToRef} />
          ),
          document.body
        )
      : null

  return (
    <>
      <span className={`cite-wrap${open ? ' open' : ''}`}>
        <button
          className="cite-marker"
          type="button"
          data-cite-n={n}
          aria-expanded={open}
          aria-label={`Reference ${n}: ${ref.author}, ${ref.year}`}
          onClick={toggle}
          onKeyDown={handleKeyDown}
        >
          <sup>{n}</sup>
        </button>
      </span>
      {expansion}
    </>
  )
}
