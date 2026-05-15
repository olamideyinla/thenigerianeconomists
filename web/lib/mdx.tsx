/**
 * MDX compilation pipeline for article bodies.
 *
 * Plugin order:
 *   remark-gfm            — GitHub-Flavored Markdown (tables, strikethrough…)
 *   remark-directive      — parse :::name{} container/leaf/text directive syntax
 *   remarkCitations       — transform {{N}} → <Citation n={N} /> in all text nodes
 *   remarkDirectives      — transform containerDirective/leafDirective → MDX JSX
 *   rehype-slug           — add id attributes to headings
 *   rehype-autolink-headings — anchor links on headings
 *
 * Component map:
 *   Citation, Pullquote, RebuttedParagraph, Dropcap, Figure
 *   h2, h3, blockquote, code, table — article-style overrides
 */

import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import type { ReactElement } from 'react'

import { remarkCitations } from './remark-citations'
import { remarkDirectives } from './remark-directives'

import { Citation } from '@/components/reader/Citation'
import { PullQuote } from '@/components/reader/PullQuote'
import { RebuttedParagraph } from '@/components/reader/RebuttedParagraph'
import { Dropcap } from '@/components/reader/Dropcap'
import { Figure } from '@/components/reader/Figure'

// ─── Heading / element overrides ──────────────────────────────────

function ArticleH2({
  children,
  id,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 id={id} className="article-h2" {...rest}>
      {children}
    </h2>
  )
}

function ArticleH3({
  children,
  id,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 id={id} className="article-h3" {...rest}>
      {children}
    </h3>
  )
}

function ArticleBlockquote({
  children,
  ...rest
}: React.HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote className="article-blockquote" {...rest}>
      {children}
    </blockquote>
  )
}

function ArticleCode({
  children,
  ...rest
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <code className="article-code" {...rest}>
      {children}
    </code>
  )
}

function ArticleTable({
  children,
  ...rest
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="article-table-wrap">
      <table className="article-table" {...rest}>
        {children}
      </table>
    </div>
  )
}

// ─── Compile ──────────────────────────────────────────────────────

const MDX_COMPONENTS = {
  Citation,
  Pullquote: PullQuote,
  RebuttedParagraph,
  Dropcap,
  Figure,
  h2: ArticleH2,
  h3: ArticleH3,
  blockquote: ArticleBlockquote,
  code: ArticleCode,
  table: ArticleTable,
} as const

// ─── Citation pre-processor ───────────────────────────────────────

/**
 * Replace {{N}} citation tokens with <Citation n={N} /> before MDX parsing.
 *
 * MDX's JSX expression parser intercepts `{...}` at the micromark level,
 * which means `{{N}}` would be consumed as an (invalid) JSX expression
 * before our remark plugin could transform it.  We solve this with a
 * string-level pass executed before compileMDX.
 *
 * Code blocks (fenced with ``` or ~~~) and inline code spans are
 * preserved verbatim.
 */
function preprocessCitations(source: string): string {
  const lines = source.split('\n')
  let inFence = false
  let fenceChar = ''

  return lines
    .map((line) => {
      // Toggle fence tracking
      const fenceMatch = line.match(/^(`{3,}|~{3,})/)
      if (fenceMatch) {
        const chars = fenceMatch[1][0]
        if (!inFence) {
          inFence = true
          fenceChar = chars
        } else if (line.trim().startsWith(fenceChar)) {
          inFence = false
        }
        return line
      }
      if (inFence) return line

      // In prose: replace inline code spans first (preserve them),
      // then replace {{N}} in the remaining segments.
      return line.replace(
        /`[^`]*`|\{\{(\d+)\}\}/g,
        (match, n) => {
          if (n === undefined) return match // inline code span — untouched
          const num = parseInt(n, 10)
          if (num < 1) return match        // not a positive integer — untouched
          return `<Citation n={${num}} />`
        }
      )
    })
    .join('\n')
}

// ─── Compile ──────────────────────────────────────────────────────

/**
 * Compile an MDX source string using the full article rendering pipeline.
 * Must be called from a React Server Component or an async route handler.
 */
export async function compileMdx(
  source: string
): Promise<{ content: ReactElement }> {
  return compileMDX({
    source: preprocessCitations(source),
    options: {
      mdxOptions: {
        remarkPlugins: [
          remarkGfm,
          remarkDirective,
          remarkCitations,
          remarkDirectives,
        ],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        ],
      },
    },
    components: MDX_COMPONENTS,
  })
}
