'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface NewArticleButtonProps {
  topics: Array<{ id: string; name: string }>
}

export function NewArticleButton({ topics }: NewArticleButtonProps) {
  const [open, setOpen] = useState(false)
  const [headline, setHeadline] = useState('')
  const [topicId, setTopicId] = useState(topics[0]?.id ?? '')
  const [, startTransition] = useTransition()
  const router = useRouter()

  async function create() {
    startTransition(async () => {
      const res = await fetch('/api/admin/articles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, topicId }),
      })
      if (res.ok) {
        const { id } = await res.json()
        router.push(`/admin/articles/${id}`)
      }
    })
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>New article</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New article</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="admin-form-field">
              <label className="admin-form-label">Headline</label>
              <input className="ref-field" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Working headline…" />
            </div>
            <div className="admin-form-field">
              <label className="admin-form-label">Topic</label>
              <select className="ref-field" value={topicId} onChange={(e) => setTopicId(e.target.value)}>
                {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={create} disabled={!headline.trim() || !topicId}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
