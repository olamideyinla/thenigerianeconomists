/**
 * Standalone MDX preview page — rendered as a React Server Component.
 * Lives in the (preview) route group so it does NOT inherit
 * app/admin/layout.tsx (no sidebar chrome).
 *
 * Accessible at /admin/preview/[id] — protected by middleware.
 */

import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { compileMdx } from '@/lib/mdx'
import { ArticleClientShell } from '@/app/(site)/(reader)/articles/[slug]/ArticleClientShell'
import type { FigureShape } from '@/context/FigureContext'
import type { RefItem } from '@/context/ReferenceContext'
import '@/styles/theme.css'
import '@/styles/styles-base.css'
import '@/styles/styles-article.css'
import '@/styles/globals.css'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PreviewPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/admin/login')

  const { id } = await params

  const article = await db.article.findUnique({
    where: { id },
    include: {
      references: { orderBy: { indexNumber: 'asc' } },
      figures: {
        include: {
          mediaAsset: true,
          chartEmbed: { include: { staticFallbackAsset: true } },
          chartNative: true,
          dataTable: true,
        },
        orderBy: { position: 'asc' },
      },
      author: true,
      topic: true,
    },
  })

  if (!article) notFound()

  const refs: RefItem[] = article.references.map((r) => ({
    author: r.author,
    year: r.year,
    title: r.title,
    pub: r.publication ?? undefined,
    url: r.url ?? undefined,
  }))

  const figures = article.figures as unknown as FigureShape[]

  let content
  if (!article.contentMdx?.trim()) {
    content = <p style={{ color: '#999', fontStyle: 'italic' }}>No content yet.</p>
  } else {
    try {
      const compiled = await compileMdx(article.contentMdx)
      content = compiled.content
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      content = (
        <pre style={{ color: '#b00', fontSize: 13, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
          MDX compile error:{'\n'}{msg}
        </pre>
      )
    }
  }

  return (
    <div style={{ padding: '32px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, padding: '8px 12px', background: '#fef9c3', borderRadius: 4, fontSize: 12, color: '#713f12' }}>
        Preview — {article.status} · not published
      </div>

      {article.kicker && (
        <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', marginBottom: 8 }}>
          {article.kicker}
        </p>
      )}
      <h1 style={{ fontFamily: 'var(--font-fraunces, serif)', fontSize: 32, fontWeight: 700, lineHeight: 1.2, marginBottom: 12 }}>
        {article.headline ?? 'Untitled'}
      </h1>
      {article.deck && (
        <p style={{ fontSize: 18, color: '#4b5563', marginBottom: 24, lineHeight: 1.5 }}>
          {article.deck}
        </p>
      )}
      <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 32 }}>
        {article.author.name} · {article.readMinutes} min read
      </p>
      <hr style={{ marginBottom: 32, border: 'none', borderTop: '1px solid #e5e7eb' }} />

      <ArticleClientShell refs={refs} figures={figures}>
        <div className="article-body">{content}</div>
      </ArticleClientShell>
    </div>
  )
}
