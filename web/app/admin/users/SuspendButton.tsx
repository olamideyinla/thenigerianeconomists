'use client'

import { useRouter } from 'next/navigation'

export function SuspendButton({ userId }: { userId: string }) {
  const router = useRouter()

  async function handleClick() {
    if (!confirm('Revoke all sessions for this user?')) return
    await fetch(`/api/admin/users/${userId}/suspend`, { method: 'POST' })
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded border border-red-200"
    >
      Revoke sessions
    </button>
  )
}
