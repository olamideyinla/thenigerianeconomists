'use client'

import type { RefItem as CitationRef } from '@/context/ReferenceContext'

interface CiteInlineProps {
  n: number
  cite: CitationRef
  onClose: () => void
  onJump: (n: number) => void
}

export function CiteInline({ n, cite, onClose, onJump }: CiteInlineProps) {
  return (
    <div className="cite-inline" role="note">
      <div className="cite-inline-head">
        <span className="cite-inline-num">{n}</span>
        <span className="cite-inline-author">
          {cite.author}, {cite.year}
        </span>
        <button
          className="cite-inline-close"
          type="button"
          onClick={onClose}
          aria-label="Close citation"
        >
          &#215;
        </button>
      </div>
      <div className="cite-inline-title">{cite.title}</div>
      {cite.pub && <div className="cite-inline-pub">{cite.pub}</div>}
      <div className="cite-inline-actions">
        {cite.url && (
          <a
            className="cite-inline-link"
            href={cite.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {cite.url} &#8599;
          </a>
        )}
        <button
          className="cite-inline-jump"
          type="button"
          onClick={() => onJump(n)}
        >
          Jump to references &#8595;
        </button>
      </div>
    </div>
  )
}
