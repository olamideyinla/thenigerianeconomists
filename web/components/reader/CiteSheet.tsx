'use client'

import type { RefItem as CitationRef } from '@/context/ReferenceContext'

interface CiteSheetProps {
  n: number
  cite: CitationRef
  onClose: () => void
  onJump: (n: number) => void
}

export function CiteSheet({ n, cite, onClose, onJump }: CiteSheetProps) {
  return (
    <div className="cite-sheet-scrim cite-sheet-fixed" onClick={onClose}>
      <div
        className="cite-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`Reference ${n}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="cite-sheet-grip" />
        <div className="cite-sheet-head">
          <span className="kicker">
            Reference {String(n).padStart(2, '0')}
          </span>
          <button
            className="cite-inline-close"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            &#215;
          </button>
        </div>
        <div className="cite-sheet-author">
          {cite.author}, {cite.year}
        </div>
        <div className="cite-sheet-title">{cite.title}</div>
        {cite.pub && <div className="cite-sheet-pub">{cite.pub}</div>}
        <div className="cite-sheet-actions">
          {cite.url && (
            <a
              className="cite-sheet-link"
              href={cite.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {cite.url} &#8599;
            </a>
          )}
          <button
            className="cite-sheet-jump"
            type="button"
            onClick={() => onJump(n)}
          >
            Jump to references
          </button>
        </div>
      </div>
    </div>
  )
}
