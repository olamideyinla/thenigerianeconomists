'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAuditLog } from '@/lib/audit'
import { indexArticle, removeFromIndex, mdxToSearchText } from '@/lib/search'
import { getResend } from '@/lib/email'
import { htmlToMdx, sanitizeMdx } from '@/lib/html-to-mdx'

// ── Auth guard ────────────────────────────────────────────────────

async function requireEditor() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || (role !== 'EDITOR' && role !== 'ADMIN')) {
    throw new Error('Unauthorized')
  }
  return session.user
}

// ── Article ───────────────────────────────────────────────────────

export async function saveArticleDraft(
  id: string,
  fields: {
    contentMdx?: string
    headline?: string
    deck?: string
    kicker?: string
    slug?: string
    excerpt?: string
    readMinutes?: number
    wordCount?: number
    authorId?: string
    topicId?: string
    scheduledFor?: string | null
  },
) {
  await requireEditor()

  const data: Record<string, unknown> = { ...fields }
  if (fields.scheduledFor !== undefined) {
    data.scheduledFor = fields.scheduledFor ? new Date(fields.scheduledFor) : null
  }

  const article = await db.article.update({
    where: { id },
    data,
    include: { author: true, topic: true },
  })

  revalidatePath(`/admin/articles/${id}`)

  // For published articles also refresh the reader page and search index
  if (article.status === 'PUBLISHED' && article.slug) {
    revalidatePath(`/articles/${article.slug}`)
    void indexArticle({
      id: article.id,
      slug: article.slug,
      headline: article.headline,
      deck: article.deck ?? '',
      kicker: article.kicker ?? '',
      contentText: mdxToSearchText(article.contentMdx ?? ''),
      authorName: article.author.name,
      topicSlug: article.topic.slug,
      topicName: article.topic.name,
      publishedAt: (article.publishedAt ?? new Date()).getTime(),
      readMinutes: article.readMinutes,
    }).catch((e) => console.error('[save] search reindex failed', e))
  }
}

export async function validateArticle(id: string): Promise<{ errors: string[] }> {
  await requireEditor()

  const article = await db.article.findUnique({
    where: { id },
    include: { references: { orderBy: { indexNumber: 'asc' } } },
  })
  if (!article) return { errors: ['Article not found'] }

  const errors: string[] = []
  const refs = article.references
  const mdx = article.contentMdx ?? ''

  // Note: a minimum of 5 references is recommended for contributors but
  // is not enforced here — editors decide on a case-by-case basis.

  // 2. Collect all {{N}} tokens
  const cited = new Set<number>()
  for (const m of mdx.matchAll(/\{\{(\d+)\}\}/g)) {
    cited.add(parseInt(m[1], 10))
  }

  // 3. Each cited N must be ≤ refs.length and the ref must exist
  for (const n of cited) {
    if (n < 1 || n > refs.length) {
      errors.push(`Citation {{${n}}} is out of range (you have ${refs.length} references).`)
    }
  }

  // 4. Each reference must be cited at least once
  for (const ref of refs) {
    if (!cited.has(ref.indexNumber)) {
      errors.push(`Reference ${ref.indexNumber} ("${ref.title}") is never cited in the text.`)
    }
  }

  // 5. Required fields
  if (!article.headline?.trim()) errors.push('Headline is required.')
  if (!article.slug?.trim()) errors.push('Slug is required.')
  if (!article.authorId) errors.push('Author is required.')
  if (!article.topicId) errors.push('Topic is required.')

  return { errors }
}

export async function publishArticle(id: string): Promise<{ errors?: string[] }> {
  const { errors } = await validateArticle(id)
  if (errors.length > 0) return { errors }

  const user = await requireEditor()

  const publishedAt = new Date()
  const article = await db.article.update({
    where: { id },
    data: { status: 'PUBLISHED', publishedAt },
    include: { author: true, topic: true },
  })

  await writeAuditLog(user.id!, 'article.publish', 'Article', id)

  // Index in MeiliSearch (non-blocking — never fails the publish)
  await indexArticle({
    id: article.id,
    slug: article.slug,
    headline: article.headline,
    deck: article.deck ?? '',
    kicker: article.kicker ?? '',
    contentText: mdxToSearchText(article.contentMdx ?? ''),
    authorName: article.author.name,
    topicSlug: article.topic.slug,
    topicName: article.topic.name,
    publishedAt: publishedAt.getTime(),
    readMinutes: article.readMinutes,
  })

  revalidatePath(`/admin/articles`)
  revalidatePath(`/admin/articles/${id}`)
  revalidatePath(`/articles/${article.slug}`)

  // ── Rebuttal alert notifications ─────────────────────────────────
  // If this article is a rebuttal of another, notify subscribers of the original.
  void sendRebuttalNotifications(article.id, article.slug, article.headline).catch(
    (e) => console.error('[rebuttal-alert] notification failed', e),
  )

  return {}
}

async function sendRebuttalNotifications(
  rebuttalArticleId: string,
  rebuttalSlug: string,
  rebuttalHeadline: string,
) {
  // Find all original articles that this article rebuts
  const rebuttalLinks = await db.rebuttal.findMany({
    where: { rebuttalArticleId },
    include: {
      originalArticle: {
        select: {
          id: true,
          slug: true,
          headline: true,
          rebuttalAlerts: { select: { email: true } },
        },
      },
      rebuttalArticle: {
        select: { author: { select: { name: true } } },
      },
    },
  })

  if (rebuttalLinks.length === 0) return

  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thenigerianeconomists.com'
  const FROM = 'The Nigerian Economist <noreply@updates.thenigerianeconomists.com>'
  const resend = getResend()

  for (const link of rebuttalLinks) {
    const original = link.originalArticle
    const subscribers = original.rebuttalAlerts
    if (subscribers.length === 0) continue

    const authorName = link.rebuttalArticle.author.name

    const messages = subscribers.map(({ email }) => {
      const unsubUrl = `${SITE}/api/articles/${original.slug}/rebuttal-alert/unsubscribe?email=${encodeURIComponent(email)}`
      return {
        from: FROM,
        to: email,
        subject: `New response to "${original.headline}" — The Nigerian Economists`,
        html: `
          <p>A new response to an article you are following has been published:</p>
          <p style="font-weight:600;font-size:1.05rem">"${original.headline}"</p>
          <p style="margin-top:1rem">Response article:</p>
          <p>
            <a href="${SITE}/articles/${rebuttalSlug}" style="color:#b45309;font-weight:600;font-size:1rem">${rebuttalHeadline}</a><br/>
            <span style="font-size:0.875rem;color:#555">by ${authorName}</span>
          </p>
          <p style="margin-top:1rem">
            <a href="${SITE}/articles/${original.slug}" style="color:#b45309">Read the original article &rarr;</a>
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:1.5rem 0"/>
          <p style="font-size:0.8rem;color:#888">
            <a href="${unsubUrl}" style="color:#888">Unsubscribe from rebuttal alerts for this article</a>
          </p>
        `,
      }
    })

    // Resend batch supports up to 100 per call
    const CHUNK = 100
    for (let i = 0; i < messages.length; i += CHUNK) {
      await resend.batch.send(messages.slice(i, i + CHUNK))
    }
  }
}

// ── Fix HTML remnants in MDX ──────────────────────────────────────

/**
 * Re-runs the HTML→MDX converter on an article's contentMdx.
 * Use this to repair articles whose content still contains raw HTML
 * from a Tiptap submission (causing MDX compile/preview errors).
 */
export async function fixArticleMdx(id: string): Promise<{ contentMdx: string }> {
  await requireEditor()
  const article = await db.article.findUnique({ where: { id }, select: { contentMdx: true } })
  if (!article) throw new Error('Article not found')

  const fixed = sanitizeMdx(article.contentMdx ?? '')
  await db.article.update({ where: { id }, data: { contentMdx: fixed } })
  revalidatePath(`/admin/articles/${id}`)
  return { contentMdx: fixed }
}

// ── References ────────────────────────────────────────────────────

export async function createReference(
  articleId: string,
  data: {
    author: string
    year: string
    title: string
    publication?: string
    url?: string
    notes?: string
  },
) {
  const user = await requireEditor()

  const maxResult = await db.reference.aggregate({
    where: { articleId },
    _max: { indexNumber: true },
  })
  const nextIndex = (maxResult._max.indexNumber ?? 0) + 1

  const ref = await db.reference.create({
    data: { articleId, indexNumber: nextIndex, ...data },
  })
  await writeAuditLog(user.id!, 'reference.create', 'Reference', ref.id, { articleId })
  revalidatePath(`/admin/articles/${articleId}`)
  return ref
}

export async function updateReference(
  refId: string,
  data: {
    author?: string
    year?: string
    title?: string
    publication?: string
    url?: string
    notes?: string
  },
) {
  await requireEditor()
  const ref = await db.reference.update({ where: { id: refId }, data })
  revalidatePath(`/admin/articles/${ref.articleId}`)
  return ref
}

export async function deleteReference(refId: string) {
  const user = await requireEditor()
  const ref = await db.reference.delete({ where: { id: refId } })
  await writeAuditLog(user.id!, 'reference.delete', 'Reference', refId, { articleId: ref.articleId })
  // Re-number remaining references
  const remaining = await db.reference.findMany({
    where: { articleId: ref.articleId },
    orderBy: { indexNumber: 'asc' },
  })
  for (let i = 0; i < remaining.length; i++) {
    await db.reference.update({
      where: { id: remaining[i].id },
      data: { indexNumber: i + 1 },
    })
  }
  revalidatePath(`/admin/articles/${ref.articleId}`)
}

// ── Figures ───────────────────────────────────────────────────────

export async function createFigure(articleId: string, kind: string) {
  const user = await requireEditor()

  const maxResult = await db.figure.aggregate({
    where: { articleId },
    _max: { position: true },
  })
  const nextPos = (maxResult._max.position ?? 0) + 1

  const figure = await db.figure.create({
    data: {
      articleId,
      kind: kind as 'IMAGE' | 'CHART_NATIVE' | 'CHART_EMBED' | 'TABLE' | 'MAP',
      position: nextPos,
      caption: '',
      source: '',
      width: 'COLUMN',
    },
  })
  await writeAuditLog(user.id!, 'figure.create', 'Figure', figure.id, { articleId, kind })
  revalidatePath(`/admin/articles/${articleId}`)
  return figure
}

export async function updateFigure(
  figureId: string,
  data: Record<string, unknown>,
) {
  const user = await requireEditor()
  const figure = await db.figure.update({ where: { id: figureId }, data })
  await writeAuditLog(user.id!, 'figure.update', 'Figure', figureId, { articleId: figure.articleId })
  revalidatePath(`/admin/articles/${figure.articleId}`)
  return figure
}

export async function deleteFigure(figureId: string) {
  const user = await requireEditor()
  const figure = await db.figure.delete({ where: { id: figureId } })
  await writeAuditLog(user.id!, 'figure.delete', 'Figure', figureId, { articleId: figure.articleId })
  revalidatePath(`/admin/articles/${figure.articleId}`)
}

// ── Rebuttal linking ──────────────────────────────────────────────

export async function linkRebuttal(
  articleId: string,
  targetSlug: string,
  stance: 'REBUTS' | 'EXTENDS' | 'QUALIFIES',
) {
  await requireEditor()

  const target = await db.article.findUnique({ where: { slug: targetSlug }, select: { id: true } })
  if (!target) throw new Error(`Article with slug "${targetSlug}" not found`)

  const existing = await db.rebuttal.findFirst({
    where: { rebuttalArticleId: articleId, originalArticleId: target.id },
  })
  if (existing) {
    await db.rebuttal.update({ where: { id: existing.id }, data: { stance } })
  } else {
    await db.rebuttal.create({
      data: { rebuttalArticleId: articleId, originalArticleId: target.id, stance },
    })
  }
  revalidatePath(`/admin/articles/${articleId}`)
}

// ── Delete article ─────────────────────────────────────────────────

/**
 * Permanently delete an article and all its data.
 * Non-cascading relations (rebuttal links, synthesis links, corrections,
 * endorsements, reader notes) are removed first, then the article itself
 * is deleted (Prisma cascades references, figures, and rebuttal alerts).
 * The MeiliSearch index entry is also removed.
 */
export async function deleteArticle(id: string): Promise<void> {
  const user = await requireEditor()

  // Remove from search index (non-blocking — never fails the delete)
  void removeFromIndex(id).catch((e) => console.error('[delete] deindex failed', e))

  // Remove non-cascading relations first to avoid FK constraint errors
  await db.rebuttal.deleteMany({
    where: { OR: [{ originalArticleId: id }, { rebuttalArticleId: id }] },
  })
  await db.synthesisArticle.deleteMany({ where: { articleId: id } })
  await db.correction.deleteMany({ where: { articleId: id } })
  await db.endorsement.deleteMany({ where: { articleId: id } })
  await db.readerNote.deleteMany({ where: { articleId: id } })

  // Delete the article — cascades to references, figures, rebuttalAlerts
  const article = await db.article.delete({ where: { id } })

  await writeAuditLog(user.id!, 'article.delete', 'Article', id, {
    headline: article.headline,
    status: article.status,
  })

  revalidatePath('/admin/articles')
  if (article.slug) revalidatePath(`/articles/${article.slug}`)
}
