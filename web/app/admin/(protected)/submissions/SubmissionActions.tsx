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
  const [error, setError] = useState('')

  async function setStatus(status: string) {
    setLoading(true)
    setError('')
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

  async function createDraft() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/submissions/${submissionId}/to-article`, {
        method: 'POST',
      })
      const data = await res.json() as { articleId?: string; error?: string }
      if (!res.ok || !data.articleId) {
        setError(data.error ?? 'Failed to create draft')
        return
      }
      router.push(`/admin/articles/${data.articleId}`)
    } catch {
      setError('Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
      {error && <p style={{ fontSize: 11, color: '#dc2626', margin: 0 }}>{error}</p>}

      {currentStatus === 'PENDING' && (
        <div style={{ display: 'flex', gap: 6, whiteSpace: 'nowrap' }}>
          <button
            onClick={createDraft}
            disabled={loading}
            className="admin-btn admin-btn-sm admin-btn-primary"
            title="Accept and open in article editor"
          >
            Accept &amp; create draft
          </button>
          <button
            onClick={() => setStatus('REJECTED')}
            disabled={loading}
            className="admin-btn admin-btn-sm"
          >
            Reject
          </button>
        </div>
      )}

      {currentStatus === 'ACCEPTED' && (
        <div style={{ display: 'flex', gap: 6, whiteSpace: 'nowrap' }}>
          <button
            onClick={createDraft}
            disabled={loading}
            className="admin-btn admin-btn-sm admin-btn-primary"
          >
            {loading ? 'Creating…' : 'Create draft article'}
          </button>
          <button
            onClick={() => setStatus('PENDING')}
            disabled={loading}
            style={{ fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
          >
            Reset
          </button>
        </div>
      )}

      {currentStatus === 'REJECTED' && (
        <button
          onClick={() => setStatus('PENDING')}
          disabled={loading}
          style={{ fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
        >
          Reset to pending
        </button>
      )}
    </div>
  )
}
