import { type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
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

  const topic = await db.topic.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description ?? null,
      displayOrder: body.displayOrder ?? 0,
    },
  })

  revalidatePath('/')
  revalidatePath('/admin/topics')

  return Response.json({ topic })
}
