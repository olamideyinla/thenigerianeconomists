'use client'

import type { RefItem as CitationRef } from '@/context/ReferenceContext'

interface CiteFootnoteProps {
  n: number
  cite: CitationRef
  onClose: () => void
}

export function CiteFootnote({ n, cite, onClose }: CiteFootnoteProps) {
  return (
    <div className="cite-fn">
      <span className="cite-fn-caret" aria-hidden="true">&#9650;</span>
      <span className="cite-fn-num">{n}</span>
      <span className="cite-fn-text">
        <em>{cite.author}</em>, {cite.year}. {cite.title}
        {cite.pub ? `. ${cite.pub}` : ''}.
      </span>
      <button
        className="cite-inline-close"
        type="button"
        onClick={onClose}
        aria-label="Close footnote"
      >
        &#215;
      </button>
    </div>
  )
}
