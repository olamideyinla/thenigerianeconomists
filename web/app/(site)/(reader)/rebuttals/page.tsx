import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { format } from 'date-fns'
import { RebuttalView, type RebuttalThreadData } from './RebuttalView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Rebuttal Index',
  description: 'All active debate threads on The Nigerian Economists.',
}

export default async function RebuttalIndexPage() {
  // Get all published articles that have been rebutted
  const originals = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      rebuttedBy: { some: { rebuttalArticle: { status: 'PUBLISHED' } } },
    },
    include: {
      author: { select: { name: true } },
      rebuttedBy: {
        where: { rebuttalArticle: { status: 'PUBLISHED' } },
        include: {
          rebuttalArticle: {
            include: { author: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
  })

  const threads: RebuttalThreadData[] = originals.map(orig => ({
    original: {
      slug: orig.slug,
      headline: orig.headline,
      authorName: orig.author.name,
      publishedAt: orig.publishedAt ? format(new Date(orig.publishedAt), 'dd MMM yyyy') : null,
    },
    rebuttals: orig.rebuttedBy.map(r => ({
      slug: r.rebuttalArticle.slug,
      headline: r.rebuttalArticle.headline,
      authorName: r.rebuttalArticle.author.name,
      stance: r.stance,
      publishedAt: r.rebuttalArticle.publishedAt ? format(new Date(r.rebuttalArticle.publishedAt), 'dd MMM yyyy') : null,
    })),
  }))

  return (
    <div className="page page-rebuttals">
      <header className="ri-head">
        <span className="kicker kicker-accent">Rebuttal index</span>
        <h1 className="ri-title">Active debates on the site</h1>
        <p className="ri-deck">
          Rebuttals on The Nigerian Economists are full articles, edited and reference-checked
          like any other. Each debate below is a thread of original piece plus responses.
        </p>
      </header>

      {threads.length === 0 ? (
        <p style={{ padding: '24px var(--gutter)', fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--ink-soft)' }}>
          No active debates yet.
        </p>
      ) : (
        <RebuttalView threads={threads} />
      )}
    </div>
  )
}
