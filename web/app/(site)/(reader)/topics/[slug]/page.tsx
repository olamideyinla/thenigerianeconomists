import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { format } from 'date-fns'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const topic = await db.topic.findUnique({ where: { slug }, select: { name: true, description: true } })
  if (!topic) return {}
  return {
    title: topic.name,
    description: topic.description ?? `All articles on ${topic.name}`,
  }
}

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params

  const [topic, allTopics] = await Promise.all([
    db.topic.findUnique({
      where: { slug },
      include: {
        articles: {
          where: { status: 'PUBLISHED' },
          include: {
            author: { select: { name: true, slug: true } },
            rebuttedBy: { select: { id: true } },
          },
          orderBy: { publishedAt: 'desc' },
        },
      },
    }),
    db.topic.findMany({ orderBy: { displayOrder: 'asc' }, select: { slug: true, name: true } }),
  ])

  if (!topic) notFound()

  return (
    <div className="page page-topic">
      <header className="topic-head">
        <span className="kicker kicker-accent">Section</span>
        <h1 className="topic-title">{topic.name}</h1>
        {topic.description && (
          <p className="topic-deck">{topic.description}</p>
        )}
        <p className="topic-deck" style={{ marginBottom: 0 }}>
          {topic.articles.length} {topic.articles.length === 1 ? 'piece' : 'pieces'} published.
        </p>
        {/* Topic sub-nav */}
        <nav className="topic-filters" aria-label="All topics">
          {allTopics.map(t => (
            <Link
              key={t.slug}
              href={`/topics/${t.slug}`}
              className={`topic-filter${t.slug === slug ? ' active' : ''}`}
            >
              {t.name}
            </Link>
          ))}
        </nav>
      </header>

      {topic.articles.length === 0 && (
        <p style={{ padding: '24px var(--gutter)', fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--ink-soft)' }}>
          No published articles in this section yet.
        </p>
      )}

      <ol className="topic-list">
        {topic.articles.map((a, i) => (
          <li key={a.id}>
            <div className="tl-num">{String(i + 1).padStart(2, '0')}</div>
            <div className="tl-body">
              <div className="tl-kicker">{a.kicker}</div>
              <Link href={`/articles/${a.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3 className="tl-head">{a.headline}</h3>
              </Link>
              {a.deck && <p className="tl-deck">{a.deck}</p>}
              <div className="tl-meta">
                <span>{a.author.name}</span>
                <span aria-hidden="true">·</span>
                {a.publishedAt && <span>{format(new Date(a.publishedAt), 'dd MMM yyyy')}</span>}
                {a.publishedAt && <span aria-hidden="true">·</span>}
                <span>{a.readMinutes} min</span>
                {a.rebuttedBy.length > 0 && (
                  <span className="rb-pill">&#8644; Rebutted {a.rebuttedBy.length}</span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
