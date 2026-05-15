'use client'

import Link from 'next/link'

interface MastheadProps {
  onMenu: () => void
}

export function Masthead({ onMenu }: MastheadProps) {
  return (
    <header className="masthead">
      <button
        className="m-btn"
        type="button"
        onClick={onMenu}
        aria-label="Open navigation menu"
        aria-haspopup="dialog"
      >
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
          <path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
        </svg>
      </button>

      <Link href="/" className="m-wordmark" aria-label="The Nigerian Economists — home">
        <span className="m-the">The</span>
        <span className="m-ne">Nigerian Economists</span>
      </Link>

      <Link href="/search" className="m-btn" aria-label="Search">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5.2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M11 11l3.2 3.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </Link>
    </header>
  )
}
