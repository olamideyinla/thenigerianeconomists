import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

async function requireEditor() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || (role !== 'EDITOR' && role !== 'ADMIN')) return null
  return session.user
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireEditor()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const author = await db.author.update({
    where: { id },
    data: {
      salutation: body.salutation || null,
      name: body.name,
      slug: body.slug,
      role: body.role,
      affiliation: body.affiliation || '',
      bio: body.bio || '',
      email: body.email || null,
      avatarUrl: body.avatarUrl || null,
      twitter: body.twitter || null,
      linkedin: body.linkedin || null,
      isStaff: body.isStaff,
    },
  })
  return Response.json({ author })
}
