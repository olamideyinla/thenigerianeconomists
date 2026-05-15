import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** Very lightweight HTML → plain-MDX converter for submission bodies. */
function htmlToMdx(html: string): string {
  return html
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n')
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
    .replace(/<ul[^>]*>|<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>|<\/ol>/gi, '\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&ldquo;|&#8220;/g, '\u201c')
    .replace(/&rdquo;|&#8221;/g, '\u201d')
    .replace(/&lsquo;|&#8216;/g, '\u2018')
    .replace(/&rsquo;|&#8217;/g, '\u2019')
    .replace(/&mdash;|&#8212;/g, '\u2014')
    .replace(/&ndash;|&#8211;/g, '\u2013')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

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
    // Try to make the slug unique if there's a collision on a different name.
    const suffix = `-${Date.now().toString(36)}`
    const slug = await db.author.findUnique({ where: { slug: nameSlug } })
      ? nameSlug + suffix
      : nameSlug

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

  // Pick the first available topic as a placeholder (editor will change it).
  const topic = await db.topic.findFirst({ orderBy: { displayOrder: 'asc' } })
  if (!topic) {
    return NextResponse.json({ error: 'No topics exist yet. Create at least one topic first.' }, { status: 422 })
  }

  // Build a unique article slug.
  const baseSlug = toSlug(submission.headline)
  const existing = await db.article.findUnique({ where: { slug: baseSlug } })
  const articleSlug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug

  const readMinutes = Math.max(1, Math.round(submission.wordCount / 200))

  const article = await db.article.create({
    data: {
      slug:       articleSlug,
      kicker:     'Analysis',
      headline:   submission.headline,
      deck:       submission.deck ?? '',
      authorId:   author.id,
      topicId:    topic.id,
      status:     'DRAFT',
      wordCount:  submission.wordCount,
      readMinutes,
      contentMdx: htmlToMdx(submission.body),
    },
  })

  // Mark the submission as accepted (if not already).
  await db.submission.update({ where: { id }, data: { status: 'ACCEPTED' } })

  return NextResponse.json({ articleId: article.id })
}
