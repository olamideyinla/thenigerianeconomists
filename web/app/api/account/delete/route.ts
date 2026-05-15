import { auth, signOut } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id

  // Delete sessions, accounts, endorsements, readerNotes, then user
  await db.session.deleteMany({ where: { userId } })
  await db.account.deleteMany({ where: { userId } })
  await db.endorsement.deleteMany({ where: { userId } })
  await db.readerNote.deleteMany({ where: { userId } })
  await db.user.delete({ where: { id: userId } })

  return Response.json({ ok: true })
}
