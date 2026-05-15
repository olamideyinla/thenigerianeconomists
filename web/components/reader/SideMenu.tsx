'use client'

import { useEffect } from 'react'
import Link from 'next/link'

const SECTIONS = [
  { slug: 'fx',          name: 'FX & Monetary Policy',  count: 47 },
  { slug: 'fiscal',      name: 'Fiscal Policy',         count: 38 },
  { slug: 'banking',     name: 'Banking & Finance',     count: 31 },
  { slug: 'behavioural', name: 'Behavioural Economics', count: 31 },
  { slug: 'political',   name: 'Political Economy',     count: 26 },
  { slug: 'welfare',     name: 'Welfare Economics',     count: 24 },
  { slug: 'subsidy',     name: 'Subsidy & Energy',      count: 22 },
  { slug: 'capital',     name: 'Capital Markets',       count: 21 },
  { slug: 'labour',      name: 'Labour & Inflation',    count: 19 },
  { slug: 'subnation',   name: 'Subnational',           count: 18 },
  { slug: 'trade',       name: 'Trade & AfCFTA',        count: 14 },
  { slug: 'health',      name: 'Health Economics',      count: 12 },
]

interface SideMenuProps {
  open: boolean
  onClose: () => void
}

export function SideMenu({ open, onClose }: SideMenuProps) {
  // Close on Escape key + lock body scroll while open
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <div
      className={`drawer ${open ? 'open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      aria-hidden={!open}
    >
      <div className="drawer-scrim" onClick={onClose} aria-hidden="true" />
      <nav className="drawer-panel" aria-label="Sections">
        <div className="drawer-head">
          <span className="kicker">Sections</span>
          <button
            className="m-btn"
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <ul className="drawer-list">
          {SECTIONS.map(s => (
            <li key={s.slug}>
              <Link href={`/topic/${s.slug}`} onClick={onClose}>
                <span className="dl-name">{s.name}</span>
                <span className="dl-count">{s.count}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="drawer-divider" />

        <ul className="drawer-list secondary">
          <li><Link href="/synthesis" onClick={onClose}>The Synthesis — weekly</Link></li>
          <li><Link href="/rebuttals" onClick={onClose}>Rebuttal index</Link></li>
          <li><Link href="/newsletter" onClick={onClose}>Newsletter</Link></li>
          <li><Link href="/about" onClick={onClose}>About the publication</Link></li>
          <li><Link href="/funders" onClick={onClose}>Funders &amp; transparency</Link></li>
          <li><Link href="/corrections" onClick={onClose}>Corrections log</Link></li>
        </ul>

        <div className="drawer-foot">
          <span className="kicker">Issue 18 · 12 May 2026</span>
          <span className="drawer-tag">thenigerianeconomists.com</span>
        </div>
      </nav>
    </div>
  )
}
