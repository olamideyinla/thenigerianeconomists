'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAuditLog } from '@/lib/audit'
import { indexArticle, removeFromIndex, mdxToSearchText } from '@/lib/search'

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

  await db.article.update({ where: { id }, data })
  revalidatePath(`/admin/articles/${id}`)
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

  // 1. Minimum references
  if (refs.length < 5) {
    errors.push(`At least 5 references required (currently ${refs.length}).`)
  }

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
  return {}
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
