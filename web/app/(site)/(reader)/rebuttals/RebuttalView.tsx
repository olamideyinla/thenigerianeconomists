'use client'
import { useState } from 'react'
import Link from 'next/link'

export interface RebuttalThreadData {
  original: {
    slug: string
    headline: string
    authorName: string
    publishedAt: string | null
  }
  rebuttals: {
    slug: string
    headline: string
    authorName: string
    stance: string
    publishedAt: string | null
  }[]
}

interface RebuttalViewProps {
  threads: RebuttalThreadData[]
}

export function RebuttalView({ threads }: RebuttalViewProps) {
  const [view, setView] = useState<'list' | 'atlas'>('list')

  return (
    <>
      <div className="ri-toggle" role="tablist" aria-label="View">
        <button role="tab" aria-selected={view === 'list'} onClick={() => setView('list')}>List</button>
        <button role="tab" aria-selected={view === 'atlas'} onClick={() => setView('atlas')}>Atlas</button>
      </div>

      {view === 'list' && (
        <ol className="ri-list">
          {threads.map((t, i) => (
            <li key={t.original.slug} className="ri-thread">
              <div className="ri-thread-head">
                <div className="ri-thread-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="ri-thread-meta">
                  <span>{t.rebuttals.length} {t.rebuttals.length === 1 ? 'response' : 'responses'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{t.original.publishedAt ?? ''}</span>
                </div>
              </div>
              <Link href={`/articles/${t.original.slug}`} className="ri-orig">
                <span className="kicker">The original</span>
                <div className="ri-orig-title">{t.original.headline}</div>
                <div className="ri-orig-author">{t.original.authorName}</div>
              </Link>
              <ul className="ri-responses">
                {t.rebuttals.map((r) => (
                  <li key={r.slug} className={`ri-r ri-r-${r.stance === 'REBUTS' ? 'rebuts' : 'extends'}`}>
                    <div className="ri-r-spine" aria-hidden="true" />
                    <div className="ri-r-body">
                      <div className="ri-r-stance">
                        {r.stance === 'REBUTS' ? '↩ Rebuts' : r.stance === 'EXTENDS' ? '→ Extends' : '→ Qualifies'}
                      </div>
                      <Link href={`/articles/${r.slug}`} className="ri-r-title" style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}>
                        {r.headline}
                      </Link>
                      <div className="ri-r-meta">{r.authorName}{r.publishedAt ? ` · ${r.publishedAt}` : ''}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}

      {view === 'atlas' && (
        <div className="atlas-wrap">
          <p className="atlas-note">
            Each original piece sits at the head of its thread; rebuttals branch off below.{' '}
            <em>Tap a node to open the piece.</em>
          </p>
          <div className="atlas">
            <svg
              viewBox={`0 0 100 ${Math.max(200, threads.length * 180)}`}
              preserveAspectRatio="xMidYMin meet"
              className="atlas-svg"
              aria-hidden="true"
            >
              {threads.map((t, ti) => {
                const baseY = ti * 180 + 50
                return t.rebuttals.map((_, ri) => {
                  const childY = baseY + 80 + ri * 50
                  const childX = 30 + ri * 40
                  return (
                    <path
                      key={`${ti}-${ri}`}
                      d={`M50 ${baseY + 8} C 50 ${(baseY + childY) / 2}, ${childX} ${(baseY + childY) / 2}, ${childX} ${childY - 8}`}
                      stroke="var(--ink-faint)"
                      strokeWidth="0.35"
                      fill="none"
                    />
                  )
                })
              })}
            </svg>
            {threads.flatMap((t, ti) => {
              const baseY = ti * 180 + 50
              const nodes = [
                <Link key={t.original.slug} href={`/articles/${t.original.slug}`}
                  className="atlas-node head"
                  style={{ left: '50%', top: `${baseY}px` }}>
                  <span className="atlas-dot" aria-hidden="true" />
                  <span className="atlas-label">{t.original.headline.substring(0, 30)}{t.original.headline.length > 30 ? '…' : ''}</span>
                </Link>,
                ...t.rebuttals.map((r, ri) => {
                  const childX = 30 + ri * 40
                  return (
                    <Link key={r.slug} href={`/articles/${r.slug}`}
                      className={`atlas-node child${r.stance !== 'REBUTS' ? ' extends' : ''}`}
                      style={{ left: `${childX}%`, top: `${baseY + 80 + ri * 50}px` }}>
                      <span className="atlas-dot" aria-hidden="true" />
                      <span className="atlas-label">{r.headline.substring(0, 20)}{r.headline.length > 20 ? '…' : ''}</span>
                    </Link>
                  )
                }),
              ]
              return nodes
            })}
          </div>
        </div>
      )}
    </>
  )
}
