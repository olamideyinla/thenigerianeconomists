import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

async function requireEditor() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || (role !== 'EDITOR' && role !== 'ADMIN')) return null
  return session.user
}

export async function POST(req: NextRequest) {
  if (!await requireEditor()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, slug, initials, role, affiliation, bio, avatarUrl, twitter, linkedin, isStaff } = body

  if (!name?.trim() || !slug?.trim() || !initials?.trim() || !role?.trim()) {
    return Response.json({ error: 'name, slug, initials and role are required' }, { status: 400 })
  }

  const author = await db.author.create({
    data: {
      name: name.trim(),
      slug: slug.trim(),
      initials: initials.trim(),
      role: role.trim(),
      affiliation: affiliation?.trim() || '',
      bio: bio?.trim() || '',
      avatarUrl: avatarUrl?.trim() || null,
      twitter: twitter?.trim() || null,
      linkedin: linkedin?.trim() || null,
      isStaff: isStaff ?? false,
    },
  })

  return Response.json({ author }, { status: 201 })
}
