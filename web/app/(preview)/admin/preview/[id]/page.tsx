/**
 * Standalone MDX preview page — rendered as a React Server Component.
 * Lives in the (preview) route group so it does NOT inherit
 * app/admin/layout.tsx (no sidebar chrome).
 *
 * Accessible at /admin/preview/[id] — protected by middleware.
 */

import React from 'react'
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

/**
 * Best-effort readable fallback when MDX compilation fails.
 * Strips Markdown/MDX markers and renders the text as styled paragraphs
 * so editors can still read and proof the content.
 */
function mdxFallback(mdx: string): React.ReactNode {
  const cleaned = mdx
    // Remove JSX/MDX component tags (e.g. <Figure id="…" />)
    .replace(/<[A-Z][^>]*\/>/g, '')
    .replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z]\w*>/g, '')
    // Remove import/export lines
    .replace(/^(import|export)\s+.*/gm, '')
    // Strip heading markers → preserve text
    .replace(/^#{1,6}\s+/gm, '')
    // Bold / italic
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    // Inline code
    .replace(/`(.+?)`/g, '$1')
    // GFM table rows — join cells with spaces
    .replace(/^\|(.+)\|$/gm, (_, cells: string) =>
      cells.split('|').map((c: string) => c.trim()).filter(Boolean).join('  ·  ')
    )
    // Table separator rows
    .replace(/^\|[-\s|]+\|$/gm, '')
    // List markers
    .replace(/^[-*+]\s+/gm, '• ')
    .replace(/^\d+\.\s+/gm, '')
    // Blockquote markers
    .replace(/^>\s*/gm, '')
    // MDX expressions
    .replace(/\{[^}]*\}/g, '')
    // Horizontal rules
    .replace(/^---+$/gm, '')
    // HTML entities that may appear
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    // Escaped chars from our converter
    .replace(/\\</g, '<').replace(/\\>/g, '>')

  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter(Boolean)

  return (
    <div style={{ fontFamily: 'Georgia, serif', fontSize: 17, lineHeight: 1.75, color: '#1a1a1a' }}>
      {paragraphs.map((para, i) => (
        <p key={i} style={{ marginBottom: '1.25rem' }}>{para}</p>
      ))}
    </div>
  )
}

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
  let compileError: string | null = null

  if (!article.contentMdx?.trim()) {
    content = <p style={{ color: '#999', fontStyle: 'italic' }}>No content yet.</p>
  } else {
    try {
      const compiled = await compileMdx(article.contentMdx)
      content = compiled.content
    } catch (err) {
      compileError = err instanceof Error ? err.message : String(err)
      // Fallback: render the raw MDX as readable prose by stripping markup
      content = mdxFallback(article.contentMdx)
    }
  }

  return (
    <div style={{ padding: '32px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, padding: '8px 12px', background: '#fef9c3', borderRadius: 4, fontSize: 12, color: '#713f12' }}>
        Preview — {article.status} · not published
      </div>
      {compileError && (
        <div style={{ marginBottom: 24, padding: '10px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 4, fontSize: 12 }}>
          <strong style={{ color: '#b91c1c' }}>MDX compile error</strong>
          <span style={{ color: '#6b7280', marginLeft: 8 }}>— content shown as plain text. Click <strong>Fix HTML</strong> in the editor toolbar to repair.</span>
          <details style={{ marginTop: 6 }}>
            <summary style={{ cursor: 'pointer', color: '#9ca3af' }}>Show error details</summary>
            <pre style={{ marginTop: 6, fontSize: 11, whiteSpace: 'pre-wrap', color: '#7f1d1d', fontFamily: 'monospace' }}>{compileError}</pre>
          </details>
        </div>
      )}

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
