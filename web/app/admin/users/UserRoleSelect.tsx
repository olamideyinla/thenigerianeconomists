'use client'

import { useRouter } from 'next/navigation'

const ROLES = ['READER', 'CONTRIBUTOR', 'EDITOR', 'ADMIN']

export function UserRoleSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  const router = useRouter()

  async function handleChange(newRole: string) {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    router.refresh()
  }

  return (
    <select
      className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white"
      defaultValue={currentRole}
      onChange={(e) => handleChange(e.target.value)}
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  )
}
