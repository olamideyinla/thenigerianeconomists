import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { format } from 'date-fns'

export const metadata: Metadata = {
  title: 'Corrections',
  description: 'A chronological log of all corrections issued by The Nigerian Economists.',
}

export default async function CorrectionsPage() {
  const corrections = await db.correction.findMany({
    orderBy: { issuedAt: 'desc' },
    include: {
      article: {
        select: { slug: true, headline: true, kicker: true },
      },
    },
  })

  const severityLabel: Record<string, string> = {
    TYPO: 'Typo',
    CLARIFICATION: 'Clarification',
    FACTUAL: 'Factual',
    SIGNIFICANT: 'Significant',
  }

  return (
    <div className="page page-topic">
      <header className="topic-head">
        <span className="kicker kicker-accent">Accountability</span>
        <h1 className="topic-title">Corrections</h1>
        <p className="topic-deck">
          A complete chronological log of all corrections issued. Factual and significant
          corrections are appended to the original article.
        </p>
      </header>

      {corrections.length === 0 && (
        <div style={{ padding: '24px var(--gutter)', fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--ink-soft)' }}>
          No corrections on record.
        </div>
      )}

      {corrections.length > 0 && (
        <ol className="topic-list" style={{ counterReset: 'none', listStyleType: 'none' }}>
          {corrections.map((c, i) => (
            <li key={c.id} style={{ display: 'grid', gridTemplateColumns: '36px 1fr', gap: '10px', padding: '18px 0', borderTop: '0.5px solid var(--rule)' }}>
              <div className="tl-num">{String(corrections.length - i).padStart(2, '0')}</div>
              <div>
                <div className="tl-kicker">
                  <span style={{ color: c.severityLevel === 'SIGNIFICANT' || c.severityLevel === 'FACTUAL' ? 'var(--accent)' : 'var(--ink-soft)' }}>
                    {severityLabel[c.severityLevel] ?? c.severityLevel}
                  </span>
                  {' \u00b7 '}
                  {format(new Date(c.issuedAt), 'dd MMM yyyy')}
                </div>
                <Link href={`/articles/${c.article.slug}`} className="tl-head" style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}>
                  {c.article.headline}
                </Link>
                <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: '15px', lineHeight: '1.45', color: 'var(--ink)', margin: '6px 0 0' }}>
                  {c.correctionText}
                </p>
                <div className="tl-meta" style={{ marginTop: '8px' }}>
                  Issued by {c.issuedBy}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
