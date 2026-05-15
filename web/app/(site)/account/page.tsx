import type { Metadata } from 'next'
import { requireUser } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { AccountClient } from './AccountClient'

export const metadata: Metadata = { title: 'Your account' }

export default async function AccountPage() {
  const user = await requireUser()

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })

  if (!dbUser) {
    return (
      <div className="page-account">
        <p>User not found. Please sign in again.</p>
      </div>
    )
  }

  return (
    <div className="page page-account">
      <h1 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        Your account
      </h1>
      <AccountClient user={dbUser} />
    </div>
  )
}
