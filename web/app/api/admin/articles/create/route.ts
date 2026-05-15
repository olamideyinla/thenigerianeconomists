import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || (role !== 'EDITOR' && role !== 'ADMIN')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { headline, topicId } = await req.json()
  if (!topicId) return Response.json({ error: 'topicId required' }, { status: 400 })

  // Need a default author — pick the first staff author or any author
  const defaultAuthor = await db.author.findFirst({ where: { isStaff: true } }) ?? await db.author.findFirst()
  if (!defaultAuthor) return Response.json({ error: 'No authors found. Create an author first.' }, { status: 400 })

  const slug = `draft-${Date.now()}`
  const article = await db.article.create({
    data: {
      headline: headline ?? 'Untitled',
      slug,
      deck: '',
      kicker: '',
      contentMdx: '',
      status: 'DRAFT',
      readMinutes: 5,
      wordCount: 0,
      authorId: defaultAuthor.id,
      topicId,
    },
  })

  return Response.json({ id: article.id })
}
