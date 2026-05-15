import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { compileMdx } from '@/lib/mdx'
import { format } from 'date-fns'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const s = await db.synthesis.findUnique({ where: { slug }, select: { title: true, issueNumber: true } })
  if (!s) return {}
  return { title: `The Synthesis #${s.issueNumber}: ${s.title}` }
}

export default async function SynthesisPage({ params }: PageProps) {
  const { slug } = await params

  const synthesis = await db.synthesis.findUnique({
    where: { slug },
    include: {
      editor: { select: { name: true, slug: true } },
      articles: {
        include: {
          article: {
            include: {
              author: { select: { name: true } },
              topic: { select: { name: true } },
            },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!synthesis || !synthesis.publishedAt) notFound()

  const { content: mdxContent } = await compileMdx(synthesis.contentMdx)

  return (
    <div className="page page-synthesis">
      <header className="synth-head">
        <div className="synth-issue">
          <span className="kicker kicker-accent">The Synthesis</span>
          <span className="synth-issue-num">&#8470;&nbsp;{synthesis.issueNumber}</span>
        </div>
        <h1 className="synth-headline">{synthesis.title}</h1>
        <div className="synth-byline">
          <em>Edited by</em>
          <Link href={`/authors/${synthesis.editor.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {synthesis.editor.name}
          </Link>
          <span aria-hidden="true">·</span>
          <span>Week of {format(new Date(synthesis.weekOf), 'dd MMM yyyy')}</span>
          <span aria-hidden="true">·</span>
          <span>{synthesis.articles.length} pieces</span>
        </div>
      </header>

      {/* Pieces in this synthesis */}
      {synthesis.articles.length > 0 && (
        <section className="synth-map">
          <span className="kicker">Pieces in this synthesis</span>
          <ol className="synth-threads">
            {synthesis.articles.map((sa, i) => (
              <li key={sa.articleId} className="synth-thread">
                <div className="synth-thread-spine">
                  <div className="synth-thread-num">0{i + 1}</div>
                  <div className="synth-thread-line" aria-hidden="true" />
                </div>
                <div className="synth-thread-body">
                  <ul className="synth-thread-pieces">
                    <li>
                      <span className="stp-glyph" aria-hidden="true">&#182;</span>
                      <div className="stp-body">
                        <div className="stp-title">
                          <Link href={`/articles/${sa.article.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {sa.article.headline}
                          </Link>
                        </div>
                        <div className="stp-meta">
                          {sa.article.author.name} · {sa.article.topic.name}
                          {sa.article.publishedAt ? ` · ${format(new Date(sa.article.publishedAt), 'dd MMM yyyy')}` : ''}
                        </div>
                      </div>
                      <Link href={`/articles/${sa.article.slug}`} className="stp-arrow" aria-hidden="true">&#8594;</Link>
                    </li>
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <hr className="rule rule-thick" />

      {/* Synthesis MDX body */}
      <section className="synth-editorial">
        {mdxContent}
      </section>

      <hr className="rule rule-thick" />
    </div>
  )
}
