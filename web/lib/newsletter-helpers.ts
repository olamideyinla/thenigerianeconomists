import { db } from '@/lib/db'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import type { ArticleCard } from '@/emails/components/EmailShell'

/** Strip MDX syntax to produce a plain-text excerpt */
export function stripMdx(mdx: string, maxLen = 220): string {
  return mdx
    .replace(/^---[\s\S]*?---\n?/, '')          // front-matter
    .replace(/<[^>]+>/g, '')                      // HTML tags
    .replace(/\{\{?\d+\}?\}/g, '')               // citation tokens
    .replace(/!\[.*?\]\(.*?\)/g, '')             // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')    // links → text
    .replace(/#{1,6}\s+/g, '')                   // headings
    .replace(/[*_`~]/g, '')                       // emphasis
    .replace(/\n+/g, ' ')                         // newlines
    .trim()
    .slice(0, maxLen)
    .replace(/\s\w+$/, '') + '…'               // clean word boundary
}

/** Fetch confirmed, active (not unsubscribed, not suppressed) subscriber emails */
export async function getActiveSubscribers(): Promise<string[]> {
  const subs = await db.newsletterSubscription.findMany({
    where: {
      confirmedAt: { not: null },
      unsubscribedAt: null,
    },
    select: { email: true },
  })
  return subs.map((s) => s.email)
}

/** Build all data needed to render a newsletter from a synthesis ID */
export async function buildSynthesisEmailData(synthesisId: string) {
  const synthesis = await db.synthesis.findUniqueOrThrow({
    where: { id: synthesisId },
    include: {
      editor: true,
      articles: {
        orderBy: { order: 'asc' },
        include: {
          article: {
            include: {
              author: true,
              topic: true,
            },
          },
        },
      },
    },
  })

  const articles: ArticleCard[] = synthesis.articles.map((sa) => ({
    headline: sa.article.headline,
    deck: sa.article.deck ?? undefined,
    kicker: sa.article.kicker ?? undefined,
    slug: sa.article.slug,
    authorName: sa.article.author.name,
    topicName: sa.article.topic?.name ?? undefined,
    readMinutes: sa.article.readMinutes ?? undefined,
  }))

  const weekOf = synthesis.weekOf
  const monthLabel = format(weekOf, 'MMMM yyyy')
  const monthStart = startOfMonth(weekOf)
  const monthEnd = endOfMonth(weekOf)

  // Topic recap for monthly: all published articles this month grouped by topic
  const monthlyArticles = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { gte: monthStart, lte: monthEnd },
    },
    include: { topic: true },
    orderBy: { publishedAt: 'desc' },
  })

  const topicMap = new Map<string, { topicName: string; topicSlug: string; articles: typeof monthlyArticles }>()
  for (const a of monthlyArticles) {
    const key = a.topicId
    if (!topicMap.has(key)) {
      topicMap.set(key, { topicName: a.topic.name, topicSlug: a.topic.slug, articles: [] })
    }
    topicMap.get(key)!.articles.push(a)
  }

  const topicSummaries = [...topicMap.values()].map((t) => ({
    topicName: t.topicName,
    topicSlug: t.topicSlug,
    articleCount: t.articles.length,
    articles: t.articles.map((a) => ({ headline: a.headline, slug: a.slug })),
  }))

  return {
    synthesis: {
      issueNumber: synthesis.issueNumber,
      weekOf: synthesis.weekOf,
      title: synthesis.title,
      excerpt: stripMdx(synthesis.contentMdx),
      slug: synthesis.slug,
      editorName: synthesis.editor.name,
    },
    articles,
    topicSummaries,
    monthLabel,
    totalPublished: monthlyArticles.length,
  }
}
