'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  submissionId: string
  currentStatus: string
}

export function SubmissionActions({ submissionId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function setStatus(status: string) {
    setLoading(true)
    try {
      await fetch(`/api/admin/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (currentStatus !== 'PENDING') {
    return (
      <button
        onClick={() => setStatus('PENDING')}
        disabled={loading}
        style={{ fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
        title="Reset to pending"
      >
        Reset
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 6, whiteSpace: 'nowrap' }}>
      <button
        onClick={() => setStatus('ACCEPTED')}
        disabled={loading}
        className="admin-btn admin-btn-sm admin-btn-primary"
      >
        Accept
      </button>
      <button
        onClick={() => setStatus('REJECTED')}
        disabled={loading}
        className="admin-btn admin-btn-sm"
      >
        Reject
      </button>
    </div>
  )
}
