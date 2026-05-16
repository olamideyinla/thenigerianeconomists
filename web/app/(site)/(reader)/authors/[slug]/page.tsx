import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const author = await db.author.findUnique({ where: { slug }, select: { name: true, role: true, affiliation: true } })
  if (!author) return {}
  return {
    title: author.name,
    description: `${author.role} at ${author.affiliation}`,
  }
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params

  const author = await db.author.findUnique({
    where: { slug },
    include: {
      disclosures: {
        orderBy: { effectiveFrom: 'desc' },
      },
      articles: {
        where: { status: 'PUBLISHED' },
        include: {
          topic: { select: { name: true, slug: true } },
          rebuttedBy: { select: { id: true } },
        },
        orderBy: { publishedAt: 'desc' },
      },
    },
  })

  if (!author) notFound()

  const currentDisclosures = author.disclosures.filter(d => !d.effectiveTo)
  const formerDisclosures = author.disclosures.filter(d => d.effectiveTo)

  return (
    <div className="page page-topic">
      <header className="topic-head">
        <span className="kicker kicker-accent">Contributor</span>
        <h1 className="topic-title">
          {author.salutation ? `${author.salutation} ${author.name}` : author.name}
        </h1>
        <p className="topic-deck">
          {author.role} · {author.affiliation}
        </p>
      </header>

      {/* Bio */}
      <div style={{ padding: '0 var(--gutter) 20px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: '17px', lineHeight: '1.6', color: 'var(--ink)' }}>
          {author.bio}
        </p>
        <div style={{ display: 'flex', gap: '14px', marginTop: '12px', fontFamily: 'var(--font-meta)', fontSize: '11px' }}>
          {author.twitter && (
            <a href={`https://twitter.com/${author.twitter}`} style={{ color: 'var(--accent)' }} target="_blank" rel="noopener noreferrer">
              X / @{author.twitter}
            </a>
          )}
          {author.linkedin && (
            <a href={author.linkedin} style={{ color: 'var(--accent)' }} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          )}
        </div>
      </div>

      {/* COI disclosures */}
      {author.disclosures.length > 0 && (
        <div style={{ padding: '0 var(--gutter) 20px' }}>
          <span className="kicker">Conflicts of interest</span>
          {currentDisclosures.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0' }}>
              {currentDisclosures.map(d => (
                <li key={d.id} style={{ padding: '10px 0', borderTop: '0.5px solid var(--rule)', fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: '1.45', color: 'var(--ink)' }}>
                  <span style={{ fontFamily: 'var(--font-meta)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-soft)', display: 'block', marginBottom: '4px' }}>
                    Current · from {format(new Date(d.effectiveFrom), 'MMM yyyy')}
                  </span>
                  {d.text}
                </li>
              ))}
            </ul>
          )}
          {formerDisclosures.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0' }}>
              {formerDisclosures.map(d => (
                <li key={d.id} style={{ padding: '10px 0', borderTop: '0.5px solid var(--rule)', fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: '1.45', color: 'var(--ink-soft)' }}>
                  <span style={{ fontFamily: 'var(--font-meta)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-soft)', display: 'block', marginBottom: '4px' }}>
                    Former · {format(new Date(d.effectiveFrom), 'MMM yyyy')} – {d.effectiveTo ? format(new Date(d.effectiveTo), 'MMM yyyy') : ''}
                  </span>
                  {d.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <hr className="rule rule-thick" />

      {/* Article portfolio */}
      <div>
        <div style={{ padding: '12px var(--gutter) 0' }}>
          <span className="kicker">All pieces</span>
          <span style={{ fontFamily: 'var(--font-meta)', fontSize: '11px', color: 'var(--ink-soft)', marginLeft: '10px' }}>
            {author.articles.length} published
          </span>
        </div>
        {author.articles.length === 0 && (
          <p style={{ padding: '12px var(--gutter)', fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--ink-soft)' }}>
            No published articles yet.
          </p>
        )}
        <ol className="topic-list">
          {author.articles.map((a, i) => (
            <li key={a.id}>
              <div className="tl-num">{String(i + 1).padStart(2, '0')}</div>
              <div className="tl-body">
                <div className="tl-kicker">{a.topic.name}</div>
                <Link href={`/articles/${a.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h3 className="tl-head">{a.headline}</h3>
                </Link>
                <div className="tl-meta">
                  {a.publishedAt && <span>{format(new Date(a.publishedAt), 'dd MMM yyyy')}</span>}
                  {a.publishedAt && <span aria-hidden="true">·</span>}
                  <span>{a.readMinutes} min</span>
                  {a.rebuttedBy.length > 0 && (
                    <span className="rb-pill">&#8644; Rebutted</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
