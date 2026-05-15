'use client'

import { useRouter } from 'next/navigation'

export function DeleteMediaButton({ id, usageCount }: { id: string; usageCount: number }) {
  const router = useRouter()

  async function handleDelete() {
    if (usageCount > 0) {
      alert(`This asset is used in ${usageCount} figure(s). Remove those figures first.`)
      return
    }
    if (!confirm('Delete this media asset permanently?')) return
    await fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded border border-red-200"
    >
      Delete
    </button>
  )
}
