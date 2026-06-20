import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { htmlToMdx } from '@/lib/html-to-mdx'

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

function toInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 3)
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!role || !['EDITOR', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  const submission = await db.submission.findUnique({ where: { id } })
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  // Find or create an Author record for the submitter.
  const nameSlug = toSlug(submission.name)
  let author = await db.author.findFirst({
    where: { OR: [{ slug: nameSlug }, { name: submission.name }] },
  })

  if (!author) {
    const collision = await db.author.findUnique({ where: { slug: nameSlug } })
    const slug = collision ? `${nameSlug}-${Date.now().toString(36)}` : nameSlug
    author = await db.author.create({
      data: {
        slug,
        name: submission.name,
        initials: toInitials(submission.name),
        role: 'Contributor',
        affiliation: submission.affiliation ?? '',
        bio: '',
        isStaff: false,
      },
    })
  }

  // Pick the first topic as a placeholder (editor will change it).
  const topic = await db.topic.findFirst({ orderBy: { displayOrder: 'asc' } })
  if (!topic) {
    return NextResponse.json(
      { error: 'No topics exist yet. Create at least one topic first.' },
      { status: 422 }
    )
  }

  // Build a unique article slug.
  const baseSlug = toSlug(submission.headline)
  const existing = await db.article.findUnique({ where: { slug: baseSlug } })
  const articleSlug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug

  const readMinutes = Math.max(1, Math.round(submission.wordCount / 200))
  const contentMdx = htmlToMdx(submission.body)

  const article = await db.article.create({
    data: {
      slug: articleSlug,
      kicker: 'Analysis',
      headline: submission.headline,
      deck: submission.deck ?? '',
      authorId: author.id,
      topicId: topic.id,
      status: 'DRAFT',
      wordCount: submission.wordCount,
      readMinutes,
      contentMdx,
      submitterEmail: submission.email,
      submitterName: submission.name,
    },
  })

  // Mark the submission as accepted.
  await db.submission.update({ where: { id }, data: { status: 'ACCEPTED' } })

  return NextResponse.json({ articleId: article.id })
}
