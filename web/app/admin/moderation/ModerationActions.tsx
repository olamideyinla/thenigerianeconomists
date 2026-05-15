'use client'

import { useRouter } from 'next/navigation'

export function ModerationActions({ noteId }: { noteId: string }) {
  const router = useRouter()

  async function act(action: 'approve' | 'reject') {
    await fetch(`/api/admin/moderation/${noteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    router.refresh()
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      <button
        onClick={() => act('approve')}
        className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100"
      >
        Approve
      </button>
      <button
        onClick={() => act('reject')}
        className="text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100"
      >
        Reject
      </button>
    </div>
  )
}
