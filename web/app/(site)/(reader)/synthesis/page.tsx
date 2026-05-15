import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { format } from 'date-fns'

export const metadata: Metadata = {
  title: 'The Synthesis',
  description: 'A fortnightly synthesis of the economic arguments shaping Nigeria.',
}

export default async function SynthesisIndexPage() {
  const syntheses = await db.synthesis.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    include: {
      editor: { select: { name: true } },
      articles: { select: { articleId: true } },
    },
  })

  return (
    <div className="page page-topic">
      <header className="topic-head">
        <span className="kicker kicker-accent">The Synthesis</span>
        <h1 className="topic-title">A fortnightly synthesis</h1>
        <p className="topic-deck">
          Each issue names a single economic problem and threads together the pieces
          that, read in sequence, make that problem visible.
        </p>
      </header>

      {syntheses.length === 0 && (
        <p style={{ padding: '24px var(--gutter)', fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--ink-soft)' }}>
          No synthesis issues published yet.
        </p>
      )}

      <ol className="topic-list">
        {syntheses.map((s, i) => (
          <li key={s.id}>
            <div className="tl-num" style={{ fontStyle: 'italic' }}>&#8470;{s.issueNumber}</div>
            <div className="tl-body">
              <div className="tl-kicker">
                Week of {s.weekOf ? format(new Date(s.weekOf), 'dd MMM yyyy') : ''}
              </div>
              <Link href={`/synthesis/${s.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3 className="tl-head">{s.title}</h3>
              </Link>
              <div className="tl-meta">
                <span>Edited by {s.editor.name}</span>
                <span aria-hidden="true">·</span>
                <span>{s.articles.length} pieces</span>
                {s.publishedAt && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{format(new Date(s.publishedAt), 'dd MMM yyyy')}</span>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
